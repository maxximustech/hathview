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
        <v-row class="px-0">
          <v-col class="col-12">
            <v-card flat color="transparent">
              <v-card-text class="px-0">

                <div v-if="$store.state.user.role === 'admin'">
                  <v-card-title>
                    <span class="text-subtitle-1 font-weight-bold align-self-end">Pending Fund Transactions</span>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="fundSearch"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field>
                  </v-card-title>
                  <v-data-table
                      :headers="fundHeaders"
                      :items="funds"
                      :search="fundSearch"
                      no-data-text="No transaction available yet"
                      no-results-text="Transaction could not be found, try another keyword"
                  >
                    <template v-slot:item.user="{ item }">
                      <span>
                        {{ toFirstUpper(item.User.lastName) }}
                      </span>
                    </template>
                    <template v-slot:item.amount="{ item }">
                      <span>
                        {{ formatPriceV2(item.amount) }}
                      </span>
                    </template>
                    <template v-slot:item.updatedAt="{ item }">
                      <span>
                        {{ formatDate(item.updatedAt) }}
                      </span>
                    </template>
                    <template v-slot:item.proof="{ item }">
                      <v-btn small plain color="green" @click="viewImage(item.image)">
                        View
                      </v-btn>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-btn small plain icon color="green"
                             :disabled="decisionLoading"
                             :loading="decisionLoading&&decisionId===item.id" @click="decideDialog(item.id,'approve')">
                        <v-icon>mdi-check</v-icon>
                      </v-btn>
                      <v-btn small plain icon color="red"
                             :disabled="decisionLoading" @click="openRejectionReasonDialog(item.id)">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>

                  <v-card-title>
                    <span class="text-subtitle-1 font-weight-bold align-self-end">Pending Withdrawal Transactions</span>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="withdrawalSearch"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field>
                  </v-card-title>
                  <v-data-table
                      :headers="withdrawalHeaders"
                      :items="withdrawals"
                      :search="withdrawalSearch"
                      no-data-text="No transaction available yet"
                      no-results-text="Transaction could not be found, try another keyword"
                  >
                    <template v-slot:item.user="{ item }">
                      <v-btn small plain color="green" @click="openUserDialog(item.User)">
                        View
                      </v-btn>
                    </template>
                    <template v-slot:item.amount="{ item }">
                      <span>
                        {{ formatPriceV2(item.amount) }}
                      </span>
                    </template>
                    <template v-slot:item.updatedAt="{ item }">
                      <span>
                        {{ formatDate(item.updatedAt) }}
                      </span>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-btn small plain icon color="green"
                             :disabled="decisionLoading"
                             :loading="decisionLoading&&decisionId===item.id" @click="decideDialog(item.id,'approve')">
                        <v-icon>mdi-check</v-icon>
                      </v-btn>
                      <v-btn small plain icon color="red"
                             :disabled="decisionLoading" @click="openRejectionReasonDialog(item.id)">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>
                </div>

                <h6 class="text-h6 font-weight-medium ml-4 mt-10 mb-2">All Transactions</h6>
                <v-text-field v-model="searchInput" :loading="searchLoading" solo rounded class="rounded-xl mt-4 mb-2" flat label="Search a transaction by reference or details" hide-details clearable append-icon="mdi-magnify" @click:append=""/>
                <v-virtual-scroll v-if="searchResult.length > 0" :bench="searchResult.length>100?100:searchResult.length" :items="searchResult" :item-height="120" height="500">
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
                <v-virtual-scroll v-else :bench="transactions.length>100?100:transactions.length" :items="transactions" :item-height="120" height="500">
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
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-dialog style="z-index: 1002;"
                  v-model="rejectDialog.show"
                  width="500"
                  persistent
        >
          <v-card class="pa-5">
            <v-card-title>
              Reject Transaction
              <v-divider class="ml-3"></v-divider>
            </v-card-title>
            <v-card-text class="pb-0">
              <v-form ref="form">
                <v-row>
                  <v-col cols="12">
                    <v-text-field label="Rejection Reason" v-model="rejectDialog.reason" :rules="[v=>!!v&&v.trim()!==''||'Reason is required']" outlined hide-details/>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-card-actions class="mt-3">
              <v-spacer></v-spacer>
              <v-btn
                  color="red"
                  text
                  :disabled="decisionLoading"
                  @click="rejectDialog.show = false"
              >
                Close
              </v-btn>
              <v-btn plain color="green" class="mr-3"
                     :loading="decisionLoading"
                     :disabled="rejectDialog.reason.trim()===''"
                     @click="decideDialog(rejectDialog.id,'reject',rejectDialog.reason)">Reject</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-if="transactionDialog.show" style="z-index: 1002;"
                  v-model="transactionDialog.show"
                  width="500"
                  persistent
        >
          <v-card color="white" class="rounded-xl pa-8" flat>
            <v-card-text class="ma-0 pa-0">
              <div class="d-flex">
                <v-spacer/>
                <div class="d-inline">
                  <div class="text-subtitle-1 font-weight-bold">
                    <v-chip class="align-self-center" dark light x-small :color="transactionDialog.transaction.status===0?'orange':(transactionDialog.transaction.status===1?'green':'red')"><span>{{transactionDialog.transaction.status===0?'Pending':(transactionDialog.transaction.status===1?'Completed':'Rejected')}}</span></v-chip>
                  </div>
                </div>
              </div>
            </v-card-text>
            <v-card-text class="ma-0 pa-0">
              <v-row v-if="$store.state.user.role==='admin'">
                <v-col cols="4">
                  <h6 class="text-subtitle-2">User</h6>
                </v-col>
                <v-col cols="8" class="text-right">
                  <h6 class="text-subtitle-2">{{toFirstUpper(transactionDialog.transaction.User.firstName)}} {{toFirstUpper(transactionDialog.transaction.User.lastName)}}</h6>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <h6 class="text-subtitle-2">Amount</h6>
                </v-col>
                <v-col cols="8" class="text-right">
                  <h6 class="text-subtitle-2">{{formatPriceV2(transactionDialog.transaction.amount)}}</h6>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <h6 class="text-subtitle-2">Description</h6>
                </v-col>
                <v-col cols="8" class="text-right">
                  <h6 class="text-subtitle-2">{{transactionDialog.transaction.data}}</h6>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <h6 class="text-subtitle-2">Date</h6>
                </v-col>
                <v-col cols="8" class="text-right">
                  <h6 class="text-subtitle-2">{{formatDate(transactionDialog.transaction.updatedAt)}}</h6>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <h6 class="text-subtitle-2">Transaction ID</h6>
                </v-col>
                <v-col cols="8" class="text-right">
                  <h6 class="text-subtitle-2">{{transactionDialog.transaction.ref}}</h6>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions class="ma-0 pa-0 mt-3">
              <v-spacer/>
              <v-btn plain color="red" @click="transactionDialog.show = false">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-if="userDialog.show" style="z-index: 1002;"
                  v-model="userDialog.show"
                  width="500"
                  persistent
        >
          <v-card color="white" class="rounded-xl pa-8" flat>
            <v-card-text class="ma-0 pa-0">
              <v-row>
                <v-col cols="4">
                  <h6 class="text-subtitle-2">User</h6>
                </v-col>
                <v-col cols="8" class="text-right">
                  <h6 class="text-subtitle-2">{{toFirstUpper(userDialog.user.firstName)}} {{toFirstUpper(userDialog.user.lastName)}}</h6>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <h6 class="text-subtitle-2">Bank Name</h6>
                </v-col>
                <v-col cols="8" class="text-right">
                  <h6 class="text-subtitle-2">{{userDialog.user.bank_name}}</h6>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <h6 class="text-subtitle-2">Account Name</h6>
                </v-col>
                <v-col cols="8" class="text-right">
                  <h6 class="text-subtitle-2">{{userDialog.user.account_name}}</h6>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <h6 class="text-subtitle-2">Account Number</h6>
                </v-col>
                <v-col cols="8" class="text-right">
                  <h6 class="text-subtitle-2">{{userDialog.user.account_no}}</h6>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions class="ma-0 pa-0 mt-3">
              <v-spacer/>
              <v-btn plain color="red" @click="userDialog.show = false">
                Close
              </v-btn>
              <v-btn plain color="green" :to="'/user/'+userDialog.user.regId">
                Go to profile
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-main>
    <Dialog :dialog="customDialog"/>
  </v-app>
</template>

<script>
import ContentLoading from "@/components/ContentLoading";
import NotFound from "@/views/NotFound";
import Dialog from "@/components/Dialog";
export default {
  name: "Transactions",
  components: {Dialog, NotFound, ContentLoading},
  metaInfo(){
    return {
      title: 'Transactions'
    }
  },
  data: ()=>({
    transactions: [
      {
        no_data: true
      }
    ],
    notFound: false,
    loadingContent: false,
    customDialog: undefined,
    s: null,
    funds: [],
    withdrawals: [],
    fundSearch: '',
    withdrawalSearch: '',
    fundHeaders: [
      {
        text: 'Title',
        value: 'data'
      },
      {
        text: 'User',
        value: 'user',
      },
      {
        text: 'Amount',
        value: 'amount',
      },
      {
        text: 'Date',
        value: 'updatedAt'
      },
      {
        text: 'Proof',
        value: 'proof',
        sortable: false
      },
      {
        text: 'Actions',
        value: 'actions',
        sortable: false
      }
    ],
    withdrawalHeaders: [
      {
        text: 'Title',
        value: 'data'
      },
      {
        text: 'User',
        value: 'user',
      },
      {
        text: 'Amount',
        value: 'amount',
      },
      {
        text: 'Date',
        value: 'updatedAt'
      },
      {
        text: 'Actions',
        value: 'actions',
        sortable: false
      }
    ],
    rejectDialog: {
      show: false,
      reason: '',
      id: ''
    },
    decisionLoading: false,
    decisionId: null,
    transactionDialog: {
      transaction: null,
      show: false
    },
    searchInput: '',
    searchResult: [],
    searchLoading: false,
    userDialog: {
      show: false,
      user: null
    }
  }),
  destroyed() {
    try{
      clearInterval(this.s);
    }catch(e){

    }
  },
  created(){
    this.debouncedSearch = this.debounce(()=>{
      this.execSearch();
    }, 1000);
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
  watch:{
    searchInput(val){
      this.debouncedSearch();
    },
  },
  methods:{
    openUserDialog(user){
      this.userDialog = {
        show: true,
        user: user
      }
    },
    execSearch(){
      if(this.searchInput == null || this.searchInput.trim().length < 3){
        this.searchResult = [];
        return;
      }
      this.searchLoading = true;
      this.loadContent('search/transactions/'+this.searchInput.trim()).then(data=>{
        this.searchLoading = false;
        if(data.status === 200){
          this.searchResult = data.result;
          if(this.searchResult.length <= 0){
            this.searchResult = [{
              no_result: true
            }];
          }
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
                  this.execSearch();
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
        this.searchLoading = false;
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
                this.execSearch();
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
    openRejectionReasonDialog(id){
      let transaction = this.transactions.find(t=>t.id===id);
      if(transaction == null){
        return;
      }
      this.rejectDialog = {
        id: transaction.id,
        reason: '',
        show: true
      }
    },
    decideDialog(id,type,reason=''){
      this.customDialog = {
        show: true,
        persistent: true,
        text: `Are you sure you want to ${type} this transaction?`,
        buttons: [
          {
            text: 'Close',
            color: 'red',
            click: ()=>{
              this.customDialog.show = false;
            }
          },
          {
            text: this.toFirstUpper(type),
            color: 'green',
            click: ()=>{
              this.customDialog.show = false;
              this.decide(id,type,reason);
            }
          },
        ]
      };
    },
    decide(id,type,reason=''){
      this.decisionLoading = true;
      this.decisionId = id;
      fetch(this.$store.state.baseUrl+'transaction/review/'+id,{
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':this.$store.state.jwt
        },
        body: JSON.stringify({
          status: type==='approve'?1:2,
          reason: reason
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.decisionLoading = false;
        this.decisionId = null;
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
                if(type==='reject'){
                  this.rejectDialog = {
                    show: false,
                    reason: '',
                    id: ''
                  };
                }
                if(data.status === 200){
                  this.fetchContent();
                }
              }
            }
          ]
        };
      }).catch(err=>{
        this.decisionLoading = false;
        this.decisionId = null;
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
                this.customDialog.show = false;
                this.decide(id,type,reason);
              }
            }
          ]
        };
      });
    },
    viewImage(img){
      this.$viewerApi({
        images: [img],
      })
    },
    fetchContent(){
      let override = '';
      if(typeof this.$route.query.override === 'string' && this.$route.query.override.trim() !== ''){
        override = '?override='+this.$route.query.override;
      }
      this.loadingContent = true;
      this.loadContent('transactions').then(data=>{
        if(data.status === 200){
          this.loadingContent = false;
          this.transactions = data.transactions;
          if(this.transactions.length <= 0){
            this.transactions = [
              {
                no_data: true
              }
            ]
          }
          this.funds = data.fundTransactions;
          this.withdrawals = data.withdrawTransactions;
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