<template>
  <v-app>
    <v-main class="add-mt px-0 px-md-3 grey lighten-4">
      <div v-if="!$store.state.contentLoaded">
        <ContentLoading/>
      </div>
      <div v-else-if="loadingContent">
        <Flicking :options="{align: 'prev'}">
          <v-skeleton-loader
              type="card-avatar"
              height="100"
              width="250"
              v-for="i in 5"
              :key="i"
              class="mr-3 rounded-xl"
          ></v-skeleton-loader>
        </Flicking>
        <v-row class="mt-5">
          <v-col cols="12" sm="6" xl="4"
                 v-for="i in 4"
                 :key="i">
            <v-skeleton-loader
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
        <v-col cols="12">
          <v-card flat color="transparent">
            <v-card-title class="text-h5 text-md-h4 text-truncate font-weight-bold">Hello {{toFirstUpper($store.state.user.firstName)+' '+toFirstUpper($store.state.user.lastName)}},</v-card-title>
          </v-card>
          <Flicking :options="{align: 'prev'}" class="" @changed="(e)=>{this.onChanged(e)}" @ready="(e)=>{this.panelCount = e.currentTarget.panelCount}">
            <div class="px-1 panel" v-for="slide in sliderCards">
              <v-card flat width="280" :color="slide.color" class="pa-3 rounded-xl">
                <v-card-text class="pa-2">
                  <div class="d-flex">
                    <div class="d-inline">
                      <v-avatar size="60" color="grey lighten-4">
                        <v-icon size="40" :color="slide.color">{{slide.icon}}</v-icon>
                      </v-avatar>
                    </div>
                    <v-spacer/>
                    <div class="d-inline text-right">
                      <h4 class="text-subtitle-2 font-weight-medium text--white text-truncate">
                        {{slide.title}}
                      </h4>
                      <div class="text-h6 font-weight-bold text-truncate">
                        {{slide.text}}
                      </div>
                      <div class="text-right">
                        <v-btn elevation="0" x-small class="ml-2" rounded v-for="(btn,b) in slide.buttons" :color="btn.color||'grey lighten-4'" :key="b" @click="clickItem(btn.click)">{{btn.text}}</v-btn>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </Flicking>
          <div class="text-center" style="z-index: 5;">
            <span v-for="l in panelCount" class="mr-2 d-inline" style="height: 0; border-bottom: solid 3px;" :style="{paddingRight: l===flickIndex+1?'40px':'20px',borderBottomColor: l===flickIndex+1?'#f8831c':'grey',}" :key="l"></span>
          </div>
          <v-card flat color="transparent">
            <v-card-text class="px-0">
              <div>
                <div class="d-flex mb-2">
                  <h4 class="text-subtitle-1 font-weight-bold align-self-center">Active thrifts</h4>
                  <v-spacer/>
                  <v-btn plain :ripple="false" color="primary" to="/thrifts">View all</v-btn>
                </div>
                <Flicking :options="{align: 'prev'}" class="">
                  <div class="px-1 panel" v-for="slide in thriftCards">
                    <v-card flat height="120" width="150" class="pa-0 rounded-xl">
                      <v-card-text style="height: 100%;" class="pa-3 d-flex flex-column">
                        <div>
                          <v-chip dark light x-small :color="formatThriftBadgeColor(slide.status)"><span>{{slide.status.split('').map((s,i)=>i===0?s.toUpperCase():s).join('')}}</span></v-chip>
                        </div>
                        <h4 class="text-subtitle-2 font-weight-medium text--white mb-2 text-truncate">
                          {{slide.title}}
                        </h4>
                        <v-progress-linear striped rounded :value="+slide.progress" :color="formatThriftCardColor(slide.progress)" background-color="grey lighten-1"></v-progress-linear>
                        <v-spacer/>
                        <div class="text-right mt-auto">
                          <v-btn plain elevation="0" small class="ml-2" rounded v-for="(btn,b) in slide.buttons" :key="b" :to="'/thrifts/'+slide.ref">{{btn.text}}</v-btn>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                  <div class="px-1 panel">
                    <v-card flat height="120" width="150" color="primary lighten-2" class="pa-0 rounded-xl">
                      <v-card-text style="height: 100%;" class="pa-3 d-flex flex-column text-center" v-ripple @click="$router.push('/thrifts')">
                        <div class="text-center">
                          <v-avatar size="60" color="white">
                            <v-icon size="40" color="primary lighten-2">mdi-plus</v-icon>
                          </v-avatar>
                        </div>
                        <div class="text-subtitle-2 mt-auto">Add New</div>
                      </v-card-text>
                    </v-card>
                  </div>
                </Flicking>
              </div>
              <div>
                <div class="d-flex mb-2">
                  <h4 class="text-subtitle-1 font-weight-bold align-self-center">Active cooperatives</h4>
                  <v-spacer/>
                  <v-btn plain :ripple="false" color="primary" to="/cooperatives">View all</v-btn>
                </div>
                <Flicking :options="{align: 'prev'}" class="">
                  <div class="px-1 panel" v-for="slide in cooperativeCards">
                    <v-card flat height="120" width="150" class="pa-0 rounded-xl">
                      <v-card-text style="height: 100%;" class="pa-3 d-flex flex-column">
                        <div>
                          <v-chip dark light x-small :color="formatThriftBadgeColor(slide.status)"><span>{{slide.status.split('').map((s,i)=>i===0?s.toUpperCase():s).join('')}}</span></v-chip>
                        </div>
                        <h4 class="text-subtitle-2 font-weight-medium text--white mb-2 text-truncate">
                          {{slide.title}}
                        </h4>
                        <v-progress-linear striped rounded :value="+slide.progress" :color="formatThriftCardColor(slide.progress)" background-color="grey lighten-1"></v-progress-linear>
                        <v-spacer/>
                        <div class="text-right mt-auto">
                          <v-btn plain elevation="0" small class="ml-2" rounded v-for="(btn,b) in slide.buttons" :key="b" :to="'/cooperatives/'+slide.ref">{{btn.text}}</v-btn>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                  <div class="px-1 panel">
                    <v-card flat height="120" width="150" color="primary lighten-2" class="pa-0 rounded-xl">
                      <v-card-text style="height: 100%;" class="pa-3 d-flex flex-column text-center" v-ripple @click="$router.push('/cooperatives')">
                        <div class="text-center">
                          <v-avatar size="60" color="white">
                            <v-icon size="40" color="primary lighten-2">mdi-plus</v-icon>
                          </v-avatar>
                        </div>
                        <div class="text-subtitle-2 mt-auto">Add New</div>
                      </v-card-text>
                    </v-card>
                  </div>
                </Flicking>
              </div>
              <div>
                <div class="d-flex mt-8 mb-2">
                  <h4 class="text-subtitle-1 font-weight-bold align-self-center">Recent transactions</h4>
                  <v-spacer/>
                  <v-btn plain :ripple="false" color="primary" to="/transactions">View all</v-btn>
                </div>
                <v-virtual-scroll :bench="transactions.length>100?100:transactions.length" :items="transactions" :item-height="120" height="500">
                  <template v-slot:default="{item}">
                    <v-list-item v-if="typeof item.no_result !== 'undefined'">
                      <v-list-item-content>
                        <v-list-item-title class="text-center">
                          <h6 class="text-subtitle-1 text-md-h6" style="font-weight: 600;">No transaction found</h6>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item v-else-if="typeof item.no_data !== 'undefined'">
                      <v-list-item-content>
                        <v-list-item-title class="text-center">
                          <h6 class="text-subtitle-1 text-md-h6" style="font-weight: 600;">You don't have any transaction yet</h6>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item three-line v-else v-ripple class="rounded-xl px-6 py-2 white" @click="openTransactionDialog(item.id)">
                      <v-list-item-content>
                        <v-list-item-subtitle>
                          <v-chip class="align-self-center" dark light x-small :color="item.status===0?'orange':(item.status===1?'green':'red')"><span>{{item.status===0?'Pending':(item.status===1?'Completed':'Rejected')}}</span></v-chip>
                        </v-list-item-subtitle>
                        <v-list-item-title class="">{{item.data}}</v-list-item-title>
                        <v-list-item-subtitle>{{formatDate(item.updatedAt)}}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <span class="text-subtitle-2" :style="{'color': item.type==='debit'?'red':'green'}">{{(item.type==='debit'?'-':'+')+item.amount.toLocaleString('en-GB')}}</span>
                      </v-list-item-action>
                    </v-list-item>
                  </template>
                </v-virtual-scroll>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
        <FundWallet :dialog="fundDialog"/>
      </div>
    </v-main>
    <Dialog :dialog="customDialog"/>
  </v-app>
</template>

<script>
import {Pagination} from "@egjs/flicking-plugins";
import ContentLoading from "@/components/ContentLoading";
import NotFound from "@/views/NotFound";
import FundWallet from "@/components/FundWallet";
import Dialog from "@/components/Dialog";
export default {
  name: "Home",
  components: {Dialog, FundWallet, NotFound, ContentLoading},
  data: ()=>({
    flickIndex: 0,
    panelCount: 0,
    sliderCards: [],
    thriftCards: [],
    transactions: [],
    cooperativeCards:[],
    s: null,
    customDialog: undefined,
    loadingContent: false,
    notFound: false,
    fundDialog: {
      show: false,
      amount: true
    }
  }),
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
  computed:{

  },
  methods: {
    clickItem(click){
      if(typeof click !== 'undefined'){
        try{
          eval(click);
        }catch(e){

        }
      }
    },
    openTransactionDialog(id){
      let transaction = this.transactions.find(t=>t.id===id);
      if(transaction == null){
        return;
      }
      this.transactionDialog = {
        transaction: transaction,
        show: true
      }
    },
    onChanged(event){
      this.panelCount = event.currentTarget.panelCount;
      this.flickIndex = event.index;
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
      this.loadContent('page/dashboard').then(data=>{
        if(data.status === 200){
          this.loadingContent = false;
          this.sliderCards = data.slides;
          this.thriftCards = data.thrifts.map(t=>{
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
              buttons: [
                {
                  text: 'View',
                  color: 'green',
                  click: ()=>{
                    this.$router.push('/thrifts/'+t.ref);
                  }
                }
              ]
            }
          });
          this.cooperativeCards = data.cooperatives.map(t=>{
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
              buttons: [
                {
                  text: 'View',
                  color: 'green',
                  click: ()=>{
                    this.$router.push('/cooperatives/'+t.ref);
                  }
                }
              ]
            }
          });
          this.transactions = data.transactions;
          if(this.transactions.length <= 0){
            this.transactions = [
              {
                no_data: true
              }
            ]
          }
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