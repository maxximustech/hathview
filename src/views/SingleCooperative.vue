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
                    <v-chip class="align-self-center" dark light x-small :color="formatCooperativeBadgeColor(cooperative.status)"><span>{{toFirstUpper(cooperative.status)}}</span></v-chip>
                    <v-spacer/>
                    <v-chip class="rounded-xl align-self-center" flat color="grey lighten-4">
                      <h6 class="text-subtitle-2 font-weight-bold">{{formatPriceV2(cooperative.Cooperative.amount)}}</h6>
                    </v-chip>
                  </div>
                  <h4 class="text-h5 font-weight-medium text--white mb-2 text-truncate">
                    {{cooperative.Cooperative.name}}
                  </h4>
                  <v-progress-linear height="10" striped class="rounded-xl" :value="cooperative.progress" :color="formatCooperativeCardColor(cooperative.progress)" background-color="grey lighten-1"></v-progress-linear>

                  <div class="d-flex ma-4 justify-end">
                    <div class="d-inline text-center">
                      <h6 class="text-caption">{{new Date(cooperative.Cooperative.startDate) < new Date()?'Started':'Starts'}}</h6>
                      <h6 class="text-subtitle-2 font-weight-bold">{{formatDateOnly(cooperative.Cooperative.startDate)}}</h6>
                    </div>
                    <div class="d-inline text-center ml-4" v-if="$store.state.user.id !== cooperative.User.id">
                      <h6 class="text-caption">{{toFirstUpper(cooperative.User.firstName)+' '+toFirstUpper(cooperative.User.lastName)}}</h6>
                      <v-btn color="green" small outlined :to="'/user/'+cooperative.User.regId">View Profile</v-btn>
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
                  Collection {{collectionDialog.position+' of '+cooperative.cooperativeCollections.length}}
                </v-card-title>
                <v-card-text class="ma-0 pa-0">
                  <h6 class="text-h5 font-weight-bold">{{formatPriceV2(collectionDialog.amount)}}</h6>
                  <h6 class="text-subtitle-2">{{formatDateOnly(collectionDialog.start)}}{{cooperative.collectionType!=='daily'?' - '+formatDateOnly(collectionDialog.end):''}}</h6>
                  <h6 class="text-subtitle-2" v-if="collectionDialog.status === 'Paid'">Transaction ID: {{collectionDialog.transactionRef}}</h6>
                </v-card-text>
                <v-card-actions class="ma-0 pa-0 mt-3">
                  <v-spacer/>
                  <v-btn plain color="red" @click="collectionDialog.show = false">
                    Close
                  </v-btn>
                  <v-btn v-if="collectionDialog.status === 'Not Paid'&&$store.state.user.wallet >= collectionDialog.amount" plain color="green" :loading="collectionDialog.loading" :disabled="new Date(cooperative.Cooperative.startDate) > new Date()" @click="payCollection">
                    {{new Date(cooperative.Cooperative.startDate) > new Date() ? 'Starts soon':'Pay Now'}}
                  </v-btn>
                  <v-btn v-if="collectionDialog.status === 'Not Paid'&&$store.state.user.wallet < collectionDialog.amount" plain color="green" @click="openFundWallet">
                    Fund Wallet
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <FundWallet :user="{...$store.state.user}" :dialog="fundDialog"/>
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
  name: "SingleCooperative",
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
        text: 'Cooperatives',
        disabled: false,
        href: '/cooperatives'
      },
      {
        text: 'Current Cooperative',
        disabled: true,
      }
    ],
    calendar: '',
    loadingContent: false,
    s: null,
    cooperative: null,
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
  methods:{
    openFundWallet(){
      this.fundDialog = {
        show: true,
        amount: ''
      }
    },
    payCollection(){
      this.collectionDialog.loading = true;
      fetch(this.$store.state.baseUrl+'cooperative/'+this.cooperative.ref+'/pay/'+this.collectionDialog.id,{
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
      let index = this.cooperative.cooperativeCollections.findIndex(t=>{
        return date.getTime() >= (new Date(t.start).getTime()-3600000)&&date.getTime() <= (new Date(t.end).getTime()-7200000);
      });
      if(index < 0){
        return;
      }
      let collection = this.cooperative.cooperativeCollections[index];
      if(this.cooperative.status==='completed'&&collection.status===0){
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
      let collection = this.cooperative.cooperativeCollections.find(t=>{
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
    formatUserCooperative(t){
      let progress = 0;
      let totalCollection = t.cooperativeCollections.length;
      let paid = t.cooperativeCollections.filter(t=>t.status===1).length;
      return {
        ...t,
        title: t.Cooperative.name,
        status: t.status===0?'inactive':(t.status===1?'active':'completed'),
        progress: Math.floor((paid/totalCollection)*100),
        amount: t.Cooperative.amount,
        updatedAt: this.formatDate(t.updatedAt),
        creator: this.toFirstUpper(t.User.firstName)+' '+this.toFirstUpper(t.User.lastName),
      }
    },
    formatCooperativeBadgeColor(status){
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
    formatCooperativeCardColor(progress){
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
      this.loadContent('cooperative/'+this.$route.params.id).then(data=>{
        if(data.status === 200){
          this.loadingContent = false;
          this.items = [
            {
              text: 'Cooperatives',
              disabled: false,
              to: '/cooperatives'
            },
            {
              text: data.cooperative.Cooperative.name,
              disabled: true,
            }
          ]
          this.cooperative = this.formatUserCooperative(data.cooperative);
          this.title = this.cooperative.name;
          //this.cooperative.cooperativeCollections = data.cooperative.cooperativeCollections.reverse();
          this.start = this.formatDateOnly(data.cooperative.Cooperative.startDate);
          this.end = this.formatDateOnly((new Date(data.cooperative.Cooperative.startDate).getTime() + (86400000 * data.cooperative.Cooperative.days) - 1000));
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