<template>
  <v-app>
    <v-main class="add-mt px-0 px-md-3 grey lighten-4">
      <v-row class="px-0 px-md-4">
        <v-col class="col-12">
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
            <v-card flat color="transparent" class="">
            <v-card-text class="px-0">
              <v-breadcrumbs class="px-0" :items="items" divider="/"/>
              <v-card class="pa-5 rounded-xl" color="white" flat>
                <div class="d-flex mb-2">
                  <v-chip class="align-self-center" dark light x-small :color="formatThriftBadgeColor(thrift.status)"><span>{{toFirstUpper(thrift.status)}}</span></v-chip>
                  <v-spacer/>
                  <v-chip class="rounded-xl align-self-center" flat color="grey lighten-4">
                    <h6 class="text-subtitle-2 font-weight-bold">{{formatPriceV2(thrift.Thrift.amount)}}</h6>
                  </v-chip>
                </div>
                <h4 class="text-h5 font-weight-medium text--white mb-2 text-truncate">
                  {{thrift.Thrift.name}}
                </h4>
                <v-progress-linear height="10" striped class="rounded-xl" :value="thrift.progress" :color="formatThriftCardColor(thrift.progress)" background-color="grey lighten-1"></v-progress-linear>

                <div class="d-flex ma-4 justify-end">
                  <div class="d-inline text-center">
                    <h6 class="text-caption">{{new Date(thrift.Thrift.startDate) < new Date()?'Started':'Starts'}}</h6>
                    <h6 class="text-subtitle-2 font-weight-bold">{{formatDateOnly(thrift.Thrift.startDate)}}</h6>
                  </div>
                  <div class="d-inline text-center ml-4" v-if="$store.state.user.id !== thrift.User.id">
                    <h6 class="text-caption">{{toFirstUpper(thrift.User.firstName)+' '+toFirstUpper(thrift.User.lastName)}}</h6>
                    <v-btn color="green" small outlined :to="'/user/'+thrift.User.regId">View Profile</v-btn>
                  </div>

                  <v-divider class="mr-3" vertical v-if="false"/>
                  <div class="d-inline text-center mr-3" v-if="false">
                    <h6 class="text-caption">Paid</h6>
                    <h6 class="text-subtitle-2 font-weight-bold">$5,000 in 28 days</h6>
                  </div>
                </div>
                <div class="mt-8">
                  <div class="d-flex mb-2">
                    <v-btn icon @click="$refs.calendar.prev()">
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                    <v-spacer/>
                    <h6 v-if="$refs.calendar" class="text-subtitle-2 font-weight-bold d-inline">{{$refs.calendar.title}}</h6>
                    <v-spacer/>
                    <v-btn icon @click="()=>{this.$refs.calendar.next()}">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </div>
                  <v-calendar v-model="calendar" ref="calendar" type="month" show-week :start="formatDateOnly(start)" :end="end">
                    <template v-slot:day-label="{year,month,date,day,time}">
                      <div @click="openCollectionDialog(year,formatMonth(month),day)" :style="{...getColor(year,formatMonth(month),day)}" class="rounded-xl pa-1">{{day===1?new Date(year,formatMonth(month),day).toLocaleString('default',{month: 'short'}):day}}</div>
                    </template>
                  </v-calendar>
                  <div v-if="loanEligible&&thrift.status!=='completed'" class="text-center my-8">
                    <v-btn width="200" outlined color="primary" @click="openLoanDialog">Apply for loan</v-btn>
                  </div>
                </div>
              </v-card>
            </v-card-text>
          </v-card>
            <v-dialog style="z-index: 1002;"
                      v-model="collectionDialog.show"
                      width="500"
                      persistent
            >
              <v-card color="white" class="rounded-xl pa-8" flat>
                <v-card-text class="ma-0 pa-0">
                  <div class="d-flex">
                    <v-spacer/>
                    <div class="d-inline">
                      <div class="text-subtitle-1 font-weight-bold">
                        <v-chip class="align-self-center" dark light x-small :color="collectionDialog.statusColor"><span>{{collectionDialog.status}}</span></v-chip>
                      </div>
                    </div>
                  </div>
                </v-card-text>
                <v-card-title class="ma-0 pa-0 text-subtitle-1">
                  Collection {{collectionDialog.position+' of '+thrift.thriftCollections.length}}
                </v-card-title>
                <v-card-text class="ma-0 pa-0">
                  <h6 class="text-h5 font-weight-bold">{{formatPriceV2(collectionDialog.amount)}}</h6>
                  <h6 class="text-subtitle-2">{{formatDateOnly(collectionDialog.start)}}{{thrift.collectionType!=='daily'?' - '+formatDateOnly(collectionDialog.end):''}}</h6>
                  <h6 class="text-subtitle-2" v-if="collectionDialog.status === 'Paid'">Transaction ID: {{collectionDialog.transactionRef}}</h6>
                </v-card-text>
                <v-card-actions class="ma-0 pa-0 mt-3">
                  <v-spacer/>
                  <v-btn plain color="red" @click="collectionDialog.show = false">
                    Close
                  </v-btn>
                  <v-btn v-if="collectionDialog.status === 'Not Paid'&&$store.state.user.wallet >= collectionDialog.amount" plain color="green" :loading="collectionDialog.loading" :disabled="new Date(thrift.Thrift.startDate) > new Date()" @click="payCollection">
                    {{new Date(thrift.Thrift.startDate) > new Date() ? 'Starts soon':'Pay Now'}}
                  </v-btn>
                  <v-btn v-if="collectionDialog.status === 'Not Paid'&&$store.state.user.wallet < collectionDialog.amount" plain color="green" @click="openFundWallet">
                    Fund Wallet
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <FundWallet :user="{...$store.state.user}" :dialog="fundDialog"/>
            <v-dialog v-if="loanEligible" style="z-index: 1002;"
                      v-model="loanDialog.show"
                      width="500"
                      persistent
            >
              <v-card class="rounded-xl pa-5">
                <v-card-title>
                  Apply for loan
                  <v-divider class="ml-3"></v-divider>
                </v-card-title>
                <v-card-text class="pb-0">
                  <v-form ref="form">
                    <v-row>
                      <v-col cols="12">
                        <h4 class="text-subtitle-2">You are qualified to get up to {{formatPriceV2(calcEligibleLoan)}} for this thrift and will be charged {{formatPriceV2(thrift.loanCharge)}} to complete the process.</h4>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field type="tel" label="Amount" v-model="loanDialog.amount" :rules="[v=>!!v||'Amount is required',v=>+v>0||'Amount must be valid']" @keyup="loanDialog.amount=+loanDialog.amount>calcEligibleLoan?calcEligibleLoan:loanDialog.amount" outlined/>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
                <v-card-actions class="mt-3">
                  <v-spacer></v-spacer>
                  <v-btn
                      color="red"
                      text :ripple="false"
                      @click="loanDialog.show = false"
                      :disabled="loanDialog.loading"
                  >
                    Close
                  </v-btn>
                  <v-btn plain color="green" class="mr-3"
                         :loading="loanDialog.loading" :ripple="false" :disabled="+loanDialog.amount<=0"
                         @click="applyLoan">Apply</v-btn>

                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </v-col>
      </v-row>
    </v-main>
    <Dialog :dialog="customDialog"/>
  </v-app>
</template>

<script>
import NotFound from "@/views/NotFound";
import ContentLoading from "@/components/ContentLoading";
import Dialog from "@/components/Dialog";
import FundWallet from "@/components/FundWallet";
export default {
  name: "SingleThrift",
  components: {FundWallet, Dialog, ContentLoading, NotFound},
  metaInfo(){
    return {
      title: this.title
    }
  },
  data: ()=>({
    customDialog: undefined,
    items: [
      {
        text: 'Thrifts',
        disabled: false,
        href: '/thrifts'
      },
      {
        text: 'Current Thrift',
        disabled: true,
      }
    ],
    calendar: '',
    loadingContent: false,
    s: null,
    thrift: null,
    notFound: false,
    start: null,
    end: null,
    collectionDialog: {
      show: false,
      id: '',
      amount: '',
      position: 0,
      start: null,
      end: null,
      status: '',
      statusColor: '',
      transactionRef: null,
      loading: false
    },
    fundDialog: {
      show: false,
      amount: ''
    },
    loanDialog: {
      show: false,
      loading: false,
      amount: ''
    },
    title: 'Loading'
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
        this.fetchContent();
      }else{
        this.$store.commit('setContentLoaded',false);
      }
    },500);
  },
  computed: {
    loanEligible(){
      let total = this.thrift.thriftCollections.length;
      let paid = this.thrift.thriftCollections.filter(c=>c.status===1).length;
      return paid/total > 0.5 && this.$store.state.user.id === this.thrift.User.id;
    },
    calcEligibleLoan(){
      let loan = 0;
      this.thrift.thriftLoans.forEach(l=>{
        loan += l.amount - l.paid;
      });
      return this.thrift.Thrift.amount - loan;
    },
  },
  methods:{
    openLoanDialog(){
      this.loanDialog = {
        show: true,
        amount: '',
        loading: false
      }
    },
    applyLoan(){
      this.loanDialog.loading = true;
      fetch(this.$store.state.baseUrl+'thrift/'+this.thrift.ref+'/loan/',{
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':this.$store.state.jwt
        },
        body: JSON.stringify(({
          amount: this.loanDialog.amount
        }))
      }).then(res=>{
        return res.json();
      }).then(data=>{
        if(data.status===200&&typeof data.wallet !== "undefined"){
          this.$store.commit('updateWallet',data.wallet);
        }
        this.loanDialog.loading = false;
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
                  this.loanDialog.show = false;
                  this.fetchContent();
                }
              }
            }
          ]
        };
      }).catch(err=>{
        this.loanDialog.loading = false;
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
                this.applyLoan();
              }
            }
          ]
        };
      });
    },
    openFundWallet(){
      this.fundDialog = {
        show: true,
        amount: ''
      }
    },
    payCollection(){
      this.collectionDialog.loading = true;
      fetch(this.$store.state.baseUrl+'thrift/'+this.thrift.ref+'/pay/'+this.collectionDialog.id,{
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':this.$store.state.jwt
        }
      }).then(res=>{
        return res.json();
      }).then(data=>{
        if(data.status===200&&typeof data.wallet !== "undefined"){
          this.$store.commit('updateWallet',data.wallet);
        }
        this.collectionDialog.loading = false;
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
                this.collectionDialog.show = false;
                if(data.status === 200){
                  this.fetchContent();
                }
              }
            }
          ]
        };
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
      }).catch(err=>{
        this.collectionDialog.loading = false;
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
                this.payCollection();
              }
            }
          ]
        };
      });
    },
    openCollectionDialog(year,month,day){
      let date = new Date(year,month,day);
      let index = this.thrift.thriftCollections.findIndex(t=>{
        return date.getTime() >= (new Date(t.start).getTime()-3600000)&&date.getTime() <= (new Date(t.end).getTime()-7200000);
      });
      if(index < 0){
        return;
      }
      let collection = this.thrift.thriftCollections[index];
      if(this.thrift.status==='completed'&&collection.status===0){
        return;
      }
      this.collectionDialog = {
        show: true,
        id: collection.id,
        amount: collection.amount,
        position: (index+1),
        start: collection.start,
        end: collection.end,
        status: collection.status===0?'Not Paid':'Paid',
        statusColor: collection.status===0?'orange':'green',
        transactionRef: collection.transactionRef,
        loading: false
      }
    },
    formatMonth(month){
      return month-1;
    },
    getColor(year,month,day){
      let date = new Date(year,month,day);
      let collection = this.thrift.thriftCollections.find(t=>{
        return date.getTime() >= (new Date(t.start).getTime()-3600000)&&date.getTime() <= (new Date(t.end).getTime()-7200000);
      });
      if(collection == null){
        return {
          backgroundColor: 'transparent',
          color: 'black'
        };
      }
      if(collection.status === 1){
        return {
          backgroundColor: '#4caf50',
          color: 'white'
        };
      }
      return {
        backgroundColor: 'orange',
        color: 'black'
      };
    },
    formatUserThrift(t){
      let progress = 0;
      let totalCollection = t.thriftCollections.length;
      let paid = t.thriftCollections.filter(t=>t.status===1).length;
      return {
        ...t,
        title: t.Thrift.name,
        status: t.status===0?'inactive':(t.status===1?'active':'completed'),
        progress: Math.floor((paid/totalCollection)*100),
        amount: t.Thrift.amount,
        updatedAt: this.formatDate(t.updatedAt),
        creator: this.toFirstUpper(t.User.firstName)+' '+this.toFirstUpper(t.User.lastName),
      }
    },
    formatThriftBadgeColor(status){
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
    formatThriftCardColor(progress){
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
    },
    fetchContent(){
      let override = '';
      if(typeof this.$route.query.override === 'string' && this.$route.query.override.trim() !== ''){
        override = '?override='+this.$route.query.override;
      }
      this.loadingContent = true;
      this.loadContent('thrift/'+this.$route.params.id).then(data=>{
        if(data.status === 200){
          this.loadingContent = false;
          this.items = [
            {
              text: 'Thrifts',
              disabled: false,
              to: '/thrifts'
            },
            {
              text: data.thrift.Thrift.name,
              disabled: true,
            }
          ]
          this.thrift = this.formatUserThrift(data.thrift);
          this.title = this.thrift.name;
          //this.thrift.thriftCollections = data.thrift.thriftCollections.reverse();
          this.start = this.formatDateOnly(data.thrift.Thrift.startDate);
          this.end = this.formatDateOnly((new Date(data.thrift.Thrift.startDate).getTime() + (86400000 * data.thrift.Thrift.days) - 1000));
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
  }
}
</script>

<style scoped>

</style>