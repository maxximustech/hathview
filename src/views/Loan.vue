<template>
  <v-app>
    <v-main class="add-mt px-0 px-md-3 grey lighten-4">
      <div v-if="!$store.state.contentLoaded">
        <ContentLoading/>
      </div>
      <div v-else-if="loadingContent">
        <v-row class="mt-5">
          <v-col cols="12"
                 v-for="i in 5"
                 :key="i">
            <v-skeleton-loader
                style="background-color: transparent"
                type="article"
            ></v-skeleton-loader>
          </v-col>
        </v-row>
      </div>
      <div v-else-if="notFound">
        <NotFound/>
      </div>
      <div v-else>
        <v-row class="px-0 ma-0">
          <v-col class="col-12">
            <v-card flat color="transparent" class="">
              <v-card-text class="px-0">
                <v-card-title>
                  <span class="text-subtitle-1 font-weight-bold align-self-end">Outstanding loans</span>
                  <v-spacer></v-spacer>
                  <v-text-field
                      v-model="loanSearch"
                      append-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                  ></v-text-field>
                </v-card-title>
                <v-data-table
                    :loading="loadingContent"
                    :headers="loanHeader"
                    :items="loans"
                    :search="loanSearch"
                    no-data-text="No outstanding loan available"
                    no-results-text="Loan could not be found, try another keyword"
                >
                  <template v-slot:item.amount="{ item }">
                    <span>{{formatPriceV2(item.amount)}}</span>
                  </template>
                  <template v-slot:item.paid="{ item }">
                    <span>{{formatPriceV2(item.paid)}}</span>
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn v-if="$store.state.user.role==='admin'" small plain color="green" :to="(typeof item.userThrift !== 'undefined'?'/thrifts/'+item.userThrift.ref:'/cooperatives/'+item.userCooperative.ref)">
                      View
                    </v-btn>
                    <v-btn v-else small plain color="green" @click="openPayDialog(item.id,(typeof item.userThrift !== 'undefined'?'thrift':'cooperative'))">
                      Pay Now
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-dialog style="z-index: 1002;"
                  v-model="payDialog.show"
                  width="500"
                  persistent
        >
          <v-card class="rounded-xl pa-5">
            <v-card-title>
              Pay Loan
              <v-divider class="ml-3"></v-divider>
            </v-card-title>
            <v-card-text class="pb-0">
              <v-form ref="form">
                <v-row>
                  <v-col cols="12">
                    <h4 class="text-subtitle-2">Please enter the amount you want to pay</h4>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field type="tel" label="Amount" v-model="payDialog.amount" :rules="[v=>!!v||'Amount is required',v=>+v>0||'Amount must be valid']" @keyup="payDialog.amount=+payDialog.amount>payDialog.loanAmount?payDialog.loanAmount:payDialog.amount" outlined/>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-card-actions class="mt-3">
              <v-spacer></v-spacer>
              <v-btn
                  color="red"
                  text :ripple="false"
                  @click="payDialog.show = false"
                  :disabled="payDialog.loading"
              >
                Close
              </v-btn>
              <v-btn v-if="$store.state.user.wallet>=payDialog.amount" plain color="green" class="mr-3"
                     :loading="payDialog.loading" :ripple="false" :disabled="+payDialog.amount<=0" @keyup="payDialog.amount=+payDialog.amount>payDialog.loanAmount?payDialog.loanAmount:payDialog.amount"
                     @click="payNow">Pay</v-btn>
              <v-btn v-else plain color="green" class="mr-3" :ripple="false"
                     @click="fundDialog.show = true">Fund wallet</v-btn>

            </v-card-actions>
          </v-card>
        </v-dialog>
        <FundWallet :dialog="fundDialog"/>
      </div>
      <Dialog :dialog="customDialog"/>
    </v-main>
  </v-app>
</template>

<script>
import ContentLoading from "@/components/ContentLoading";
import NotFound from "@/views/NotFound";
import Dialog from "@/components/Dialog";
import FundWallet from "@/components/FundWallet";
export default {
  name: "Loan",
  components: {FundWallet, Dialog, NotFound, ContentLoading},
  metaInfo(){
    return {
      title: 'Loans'
    }
  },
  data: ()=>({
    loans: [],
    s: null,
    customDialog: undefined,
    fundDialog: {
      show: false,
      amount: ''
    },
    loadingContent: true,
    loanHeader: [
      {
        text: 'From',
        value: 'from'
      },
      {
        text: 'Amount',
        value: 'amount',
      },
      {
        text: 'Paid',
        value: 'paid'
      },
      {
        text: 'Actions',
        value: 'actions',
        sortable: false
      }
    ],
    loanSearch: '',
    notFound: false,
    payDialog: {
      show: false,
      loading: false,
      loanAmount: '',
      amount: '',
      id: null,
      type: ''
    }
  }),
  destroyed() {
    try{
      clearInterval(this.s);
    }catch(e){

    }
  },
  created(){
    this.loadingContent = true;
    this.s = setInterval(()=>{
      if(!this.$store.state.loadingAuth){
        this.$store.commit('setContentLoaded',true);
        clearInterval(this.s);
        if(!this.isLoggedIn){
          return this.$router.push('/login?goto='+this.formatPath());
        }
        if(this.$store.state.user.role === 'admin'){
          this.loanHeader.unshift(
              {
                text: 'User',
                value: 'name'
              }
          )
        }
        this.fetchContent();
      }else{
        this.$store.commit('setContentLoaded',false);
      }
    },500);
  },
  computed:{

  },
  methods:{
    openPayDialog(id,type){
      let loan = this.loans.find(l=>{
        if(type==='thrift'){
          return l.id===id&&typeof l.userThrift!=='undefined';
        }else{
          return l.id===id&&typeof l.userCooperative!=='undefined';
        }
      });
      if(loan==null){
        return;
      }
      let left = loan.amount - loan.paid;
      this.payDialog = {
        show: true,
        loading: false,
        loanAmount: left,
        amount: '',
        id: loan.id,
        type: type
      }
    },
    payNow(){
      this.payDialog.loading = true;
      fetch(this.$store.state.baseUrl+'loan/'+this.payDialog.id+'/pay/',{
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':this.$store.state.jwt
        },
        body: JSON.stringify(({
          amount: this.payDialog.amount,
          type: this.payDialog.type,
        }))
      }).then(res=>{
        return res.json();
      }).then(data=>{
        if(data.status===200&&typeof data.wallet !== "undefined"){
          this.$store.commit('updateWallet',data.wallet);
        }
        if(data.status===426){
          this.customDialog.buttons.push({
            text: 'Fund Wallet',
            color: 'green',
            click: ()=>{
              this.customDialog.show = false;
              this.fundDialog.amount = '';
              this.fundDialog.show = true;
            }
          });
        }
        this.payDialog.loading = false;
        this.customDialog = {
          show: true,
          persistent: true,
          text: data.message,
          icon: data.status===200?'success':'error',
          buttons: [
            {
              text: 'Close',
              color: data.status===200?'primary':'red',
              click: ()=>{
                this.customDialog.show = false;
                if(data.status === 200){
                  this.payDialog.show = false;
                  this.fetchContent();
                }
              }
            }
          ]
        };
      }).catch(err=>{
        this.payDialog.loading = false;
        this.customDialog = {
          show: true,
          persistent: true,
          text: err.message,
          icon: 'error',
          buttons: [
            {
              text: 'Close',
              color: 'red',
              click: ()=>{
                this.customDialog.show = false;
              }
            },
            {
              text: 'Retry',
              color: 'orange',
              click: ()=>{
                this.payNow();
              }
            }
          ]
        };
      });
    },
    fetchContent(){
      let override = '';
      if(typeof this.$route.query.override === 'string' && this.$route.query.override.trim() !== ''){
        override = '?override='+this.$route.query.override;
      }
      this.loadingContent = true;
      this.loadContent('loans/').then(data=>{
        if(data.status === 200){
          this.loadingContent = false;
          this.loans = data.loans.map(l=>{
            return {
              ...l,
              name: this.toFirstUpper(l.User.firstName)+' '+this.toFirstUpper(l.User.lastName),
              from: typeof l.userThrift !== "undefined"?l.userThrift.Thrift.name:l.userCooperative.Cooperative.name,
            }
          });
        }else if(data.status === 401){
          return this.$router.push('/login?goto='+this.formatPath());
        }else if(data.status === 403 || data.status === 404){
          this.loadingContent = false;
          return this.notFound = true;
        }else{
          this.customDialog = {
            show: true,
            persistent: true,
            text: data.message,
            icon: 'error',
            buttons: [
              {
                text: 'Retry',
                color: 'orange',
                click: ()=>{
                  this.customDialog.show = false;
                  this.fetchContent();
                }
              },
              {
                text: 'Close',
                color: 'red',
                click: ()=>{
                  this.customDialog.show = false;
                }
              }
            ]
          };
        }
      }).catch(err=>{
        this.customDialog = {
          show: true,
          persistent: true,
          text: err.message,
          icon: 'error',
          buttons: [
            {
              text: 'Retry',
              color: 'orange',
              click: ()=>{
                this.customDialog.show = false;
                this.fetchContent();
              }
            },
            {
              text: 'Close',
              color: 'red',
              click: ()=>{
                this.customDialog.show = false;
              }
            }
          ]
        };
      });
    },
    formatLoanBadgeColor(status){
      let p = status;
      if(p === 'completed'){
        return 'green';
      }
      if(p === 'active'){
        return 'green';
      }
      if(p === 'inactive'){
        return 'red';
      }
      return 'orange';
    },
    formatLoanCardColor(progress){
      let p = +progress;
      if(p <= 35){
        return 'red';
      }
      if(p <= 70){
        return 'orange';
      }
      if(p < 100){
        return 'amber';
      }
      return 'green';
    }
  }
}
</script>

<style scoped>

</style>