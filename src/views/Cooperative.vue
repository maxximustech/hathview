<template>
  <v-app>
    <v-main class="add-mt px-0 px-md-3 grey lighten-4">
      <v-row class="px-0">
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
                <div v-if="$store.state.user.role === 'customer'">
                  <div class="d-flex mb-2">
                    <h4 class="text-subtitle-1 font-weight-bold align-self-center">Active cooperatives</h4>
                    <v-spacer/>
                  </div>
                  <div v-if="activeCooperatives.length>0">
                    <Flicking :options="{align: 'prev'}" class="">
                      <div class="px-1 panel" v-for="slide in activeCooperatives">
                        <v-card flat height="120" width="150" class="pa-0 rounded-xl">
                          <v-card-text style="height: 100%;" class="pa-3 d-flex flex-column">
                            <div>
                              <v-chip dark light x-small :color="formatCooperativeBadgeColor(slide.status)"><span>{{slide.status.split('').map((s,i)=>i===0?s.toUpperCase():s).join('')}}</span></v-chip>
                            </div>
                            <h4 class="text-subtitle-1 font-weight-medium text--white mb-2 text-truncate">
                              {{slide.title}}
                            </h4>
                            <v-progress-linear striped rounded :value="+slide.progress" :color="formatCooperativeCardColor(slide.progress)" background-color="grey lighten-1"></v-progress-linear>
                            <v-spacer/>
                            <div class="text-right mt-auto">
                              <v-btn plain elevation="0" small class="ml-2" rounded v-for="(btn,b) in slide.buttons" :key="b" :to="'/cooperatives/'+slide.ref">{{btn.text}}</v-btn>
                            </div>
                          </v-card-text>
                        </v-card>
                      </div>
                    </Flicking>
                  </div>
                  <div v-else>
                    <v-row>
                      <v-col cols="12" class="text-center">
                        <h4 class="text-h6 font-weight-bold">You have no active cooperative</h4>
                      </v-col>
                    </v-row>
                  </div>
                </div>
                <div v-if="$store.state.user.role === 'customer'">
                  <div class="d-flex mb-2 mt-3">
                    <h4 class="text-subtitle-1 font-weight-bold align-self-center">Available cooperatives</h4>
                    <v-spacer/>
                  </div>
                  <div v-if="availableCooperatives.length>0">
                    <Flicking :options="{align: 'prev'}" class="">
                      <div class="px-1" v-for="(cooperative,w) in availableCooperatives" :key="w">
                        <v-card color="white" class="rounded-xl pa-5" flat min-width="320">
                          <v-card-text class="ma-0 pa-0">
                            <v-chip color="blue" x-small class="pa-2 white--text">
                              {{cooperative.status}}
                            </v-chip>
                          </v-card-text>
                          <v-card-title class="ma-0 pa-0 text-subtitle-1">
                            {{cooperative.name}}
                          </v-card-title>
                          <v-card-text class="ma-0 pa-0">
                            <h6 class="text-h5 font-weight-bold">{{formatPriceV2(cooperative.amount)}}</h6>
                            <h6 class="text-subtitle-2">Starts: {{cooperative.starts}}</h6>
                            <v-row class="my-4">
                              <v-col v-for="slot in cooperative.userCooperatives" :key="'s'+slot.id" cols="4" class="pa-1">
                                <v-card flat color="green lighten-2" class="pa-0 py-3 rounded-xl" v-ripple>
                                  <v-card-text style="height: 100%;" class="pa-3 d-flex flex-column text-center">
                                    <div class="text-center">
                                      <v-avatar size="50" color="white">
                                        <v-icon size="30" color="green lighten-2">mdi-account</v-icon>
                                      </v-avatar>
                                    </div>
                                  </v-card-text>
                                </v-card>
                              </v-col>
                              <template v-if="getFreeSlots(cooperative)>0">
                                <v-col v-for="z in getFreeSlots(cooperative)" :key="z" cols="4" class="pa-1">
                                  <v-card flat color="primary lighten-2" class="pa-0 py-3 rounded-xl" v-ripple>
                                    <v-card-text style="height: 100%;" class="pa-3 d-flex flex-column text-center" @click="openJoinCooperativeDialog(cooperative.id)">
                                      <div class="text-center">
                                        <v-avatar size="50" color="white">
                                          <v-icon size="30" color="primary lighten-2">mdi-plus</v-icon>
                                        </v-avatar>
                                      </div>
                                    </v-card-text>
                                  </v-card>
                                </v-col>
                              </template>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </div>
                    </Flicking>
                  </div>
                  <div v-else>
                    <v-row>
                      <v-col cols="12" class="text-center">
                        <h4 class="text-h6 font-weight-bold">You have no available cooperative</h4>
                      </v-col>
                    </v-row>
                  </div>
                </div>
                <div>
                  <v-card-title>
                    <span class="text-subtitle-1 font-weight-bold align-self-end">{{$store.state.user.role === 'customer'?'My':'User'}} cooperatives</span>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="userCooperativeSearch"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field>
                  </v-card-title>
                  <v-data-table
                      :loading="loadingContent"
                      :headers="userCooperativeHeaders"
                      :items="userCooperatives"
                      :search="userCooperativeSearch"
                      no-data-text="No cooperative available yet"
                      no-results-text="Cooperative could not be found, try another keyword"
                  >
                    <template v-slot:item.amount="{ item }">
                      <span>
                        {{ formatPriceV2(item.amount) }}
                      </span>
                    </template>
                    <template v-slot:item.progress="{ item }">
                      <v-progress-linear striped rounded :value="+item.progress" :color="formatCooperativeCardColor(item.progress)" background-color="grey lighten-1"></v-progress-linear>
                    </template>
                    <template v-slot:item.status="{ item }">
                      <v-chip
                          small
                          :color="formatCooperativeBadgeColor(item.status)"
                          dark
                      >
                        {{ toFirstUpper(item.status) }}
                      </v-chip>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-btn small plain v-for="(btn,x) in item.buttons" :key="x" :color="btn.color" @click="btn.click">
                        {{btn.text}}
                      </v-btn>
                    </template>
                  </v-data-table>
                </div>
                <div v-if="$store.state.user.role === 'admin'">
                  <div class="d-flex mt-10 mb-n5">
                    <v-spacer/>
                    <v-btn plain :ripple="false" color="primary" @click="openCooperativeDialog(null)">Create New</v-btn>
                  </div>
                  <v-card-title>
                    <span class="text-subtitle-1 font-weight-bold align-self-end">Admin cooperatives</span>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="allCooperativeSearch"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field>
                  </v-card-title>
                  <v-data-table
                      :loading="loadingContent"
                      :headers="allCooperativeHeaders"
                      :items="allCooperatives"
                      :search="allCooperativeSearch"
                      no-data-text="No cooperative available yet"
                      no-results-text="Cooperative could not be found, try another keyword"
                  >
                    <template v-slot:item.amount="{ item }">
                      <span>
                        {{ formatPriceV2(item.amount) }}
                      </span>
                    </template>
                    <template v-slot:item.status="{ item }">
                      <v-chip
                          small
                          :color="formatCooperativeAdminColor(item.status)"
                          dark
                      >
                        {{ toFirstUpper(item.status) }}
                      </v-chip>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-btn small plain v-for="(btn,b) in item.buttons" :key="b" :color="btn.color" @click="btn.click">
                        {{btn.text}}
                      </v-btn>
                    </template>
                  </v-data-table>
                </div>
              </v-card-text>
            </v-card>
            <v-dialog style="z-index: 1002;"
                      v-model="cooperativeDialog.show"
                      width="500"
                      persistent
            >
              <v-card class="pa-5">
                <v-card-title>
                  {{+cooperativeDialog.id<=0?'Create New':'Edit'}} Cooperative
                  <v-divider class="ml-3"></v-divider>
                </v-card-title>
                <v-card-text class="pb-0">
                  <v-form ref="form">
                    <v-row>
                      <v-col cols="12">
                        <v-text-field label="Name" v-model="cooperativeDialog.name" :rules="rules.name" outlined hide-details/>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field label="Amount" type="number" v-model="cooperativeDialog.amount" :rules="rules.amount" outlined hide-details/>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field label="Slot" type="number" v-model="cooperativeDialog.slot" :rules="rules.slot" outlined hide-details/>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field label="Commission" type="number" v-model="cooperativeDialog.commission" :rules="rules.commission" outlined hide-details/>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field label="Interest" type="number" v-model="cooperativeDialog.interest" :rules="rules.interest" outlined hide-details/>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field label="Days" type="number" v-model="cooperativeDialog.days" :rules="rules.days" outlined hide-details/>
                      </v-col>
                      <v-col cols="12">
                        <v-checkbox v-model="cooperativeDialog.allowDaily" color="primary" hide-details label="Allow Daily Collection"></v-checkbox>
                        <v-checkbox v-model="cooperativeDialog.allowWeekly" color="primary" hide-details label="Allow Weekly Collection"></v-checkbox>
                        <v-checkbox v-model="cooperativeDialog.allowMonthly" color="primary" hide-details label="Allow Monthly Collection"></v-checkbox>
                      </v-col>
                      <v-col cols="12">
                        <v-dialog
                            ref="newCooperativeStartsDialog"
                            v-model="newCooperativeStartsModal"
                            :return-value.sync="cooperativeDialog.starts"
                            persistent
                            width="290px"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                v-model="cooperativeDialog.starts"
                                label="Start date"
                                append-icon="mdi-calendar"
                                readonly
                                v-bind="attrs"
                                v-on="on" outlined
                                hide-details
                                :rules="rules.starts"
                            ></v-text-field>
                          </template>
                          <v-date-picker
                              v-model="cooperativeDialog.starts"
                              scrollable
                          >
                            <v-spacer></v-spacer>
                            <v-btn
                                text
                                color="red"
                                @click="newCooperativeStartsModal = false"
                            >
                              Close
                            </v-btn>
                            <v-btn
                                text
                                color="orange"
                                @click="cooperativeDialog.starts = null"
                            >
                              Clear
                            </v-btn>
                            <v-btn
                                text
                                color="primary"
                                @click="$refs.newCooperativeStartsDialog.save(cooperativeDialog.starts)"
                            >
                              OK
                            </v-btn>
                          </v-date-picker>
                        </v-dialog>
                      </v-col>
                      <v-col cols="12">
                        <v-select hide-details label="Select Collectors" v-model="cooperativeDialog.collectorIds" :items="collectors" multiple item-text="name" item-value="id" :rules="rules.collectors"/>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
                <v-card-actions class="mt-3">
                  <v-spacer></v-spacer>
                  <v-btn
                      color="red"
                      text
                      @click="cooperativeDialog.show = false"
                      :disabled="newCooperativeLoading"
                  >
                    Close
                  </v-btn>
                  <v-btn plain color="green" class="mr-3"
                         :disabled="validateNewCooperative"
                         :loading="newCooperativeLoading"
                         @click="postCooperative">{{+cooperativeDialog.id<=0?'Create':'Update'}}</v-btn>

                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog style="z-index: 1002;"
                      v-model="joinCooperativeDialog.show"
                      width="500"
                      persistent
            >
              <v-card color="white" class="rounded-xl pa-8" flat>
                <v-card-text class="ma-0 pa-0">
                  <div class="d-flex">
                    <v-spacer/>
                    <div class="d-inline">
                      <div class="text-subtitle-1 font-weight-bold">{{formatPriceV2(joinCooperativeDialog.commission)}}</div>
                      <div class="green--text text-caption mt-n2">Commission</div>
                    </div>
                    <v-divider class="mx-4" vertical/>
                    <div class="d-inline">
                      <div class="text-subtitle-1 font-weight-bold">{{joinCooperativeDialog.interest}}%</div>
                      <div class="green--text text-caption mt-n2">Interest</div>
                    </div>
                  </div>
                </v-card-text>
                <v-card-title class="ma-0 pa-0 text-subtitle-1">
                  {{joinCooperativeDialog.name}}
                </v-card-title>
                <v-card-text class="ma-0 pa-0">
                  <h6 class="text-h5 font-weight-bold">{{formatPriceV2(joinCooperativeDialog.amount)}}</h6>
                  <h6 class="text-subtitle-2">{{new Date(joinCooperativeDialog.starts) < new Date()?'Started':'Starts'}}: {{formatDateOnly(joinCooperativeDialog.starts)}}</h6>
                  <v-select class="mt-2" flat label="Select collection type" :items="joinCooperativeDialog.types" v-model="joinCooperativeDialog.type" hide-details solo outlined/>
                </v-card-text>
                <v-card-actions class="ma-0 pa-0 mt-3">
                  <v-spacer/>
                  <v-btn plain color="red" @click="joinCooperativeDialog.show = false">
                    Close
                  </v-btn>
                  <v-btn plain color="green" :disabled="joinCooperativeDialog.type==null||new Date(joinCooperativeDialog.starts) > new Date()" :loading="joinCooperativeDialog.loading" @click="joinCooperativeConfirmation">
                    {{new Date(joinCooperativeDialog.starts) > new Date()?'Starts soon':'Join'}}
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
import Dialog from "@/components/Dialog";
import ContentLoading from "@/components/ContentLoading";
import NotFound from "@/views/NotFound";
import FundWallet from "@/components/FundWallet";
export default {
  name: "Cooperative",
  components: {FundWallet, NotFound, ContentLoading, Dialog},
  metaInfo(){
    return {
      title: 'Cooperative'
    }
  },
  data: ()=>({
    customDialog: undefined,
    activeCooperatives: [],
    availableCooperatives: [],
    userCooperatives: [],
    allCooperatives: [],
    cooperativeDialog: {
      show: false,
      id: null,
      name: '',
      amount: '',
      allowDaily: true,
      allowWeekly: false,
      allowMonthly: false,
      collectorIds: [],
      days: '',
      starts: null,
      commission: '',
      interest: '',
      slot: ''
    },
    collectors: [],
    rules:{
      name: [
        v => !!v || 'Name is required',
      ],
      amount: [
        v => !!v || 'Amount is required',
        v => +v > 0 || 'Please set a valid amount',
      ],
      commission: [
        v => !!v || 'Commission is required',
      ],
      slot: [
        v => !!v&&+v>0 || 'Slot is invalid',
      ],
      interest: [
        v => !!v || 'Interest is required',
      ],
      days: [
        v => !!v || 'Days is required',
        v => +v > 0 || 'Please set valid days',
      ],
      starts: [
        v => !!v || 'Start date is required',
      ],
      collectors: [
        v => v.length > 0 || 'Select at least one collector',
      ],
    },
    newCooperativeStartsModal: false,
    newCooperativeLoading: false,
    loadingContent: false,
    s: null,
    userCooperativeSearch: '',
    allCooperativeSearch: '',
    userCooperativeHeaders: [
      {
        text: 'Title',
        value: 'title'
      },
      {
        text: 'Amount',
        value: 'amount',
      },
      {
        text: 'Status',
        value: 'status'
      },
      {
        text: 'Progress',
        value: 'progress'
      },
      {
        text: 'Last updated',
        value: 'updatedAt'
      },
      {
        text: 'Actions',
        value: 'actions',
        sortable: false
      }
    ],
    allCooperativeHeaders: [
      {
        text: 'Title',
        value: 'name'
      },
      {
        text: 'Amount',
        value: 'amount',
      },
      {
        text: 'Status',
        value: 'status'
      },
      {
        text: 'Last updated',
        value: 'updatedAt'
      },
      {
        text: 'Actions',
        value: 'actions',
        sortable: false
      }
    ],
    notFound: false,
    types: ['Daily','Weekly','Monthly'],
    joinCooperativeDialog: {
      id: null,
      name: '',
      amount: '',
      commission: '',
      interest: '',
      slot: '',
      type: null,
      starts: '',
      loading: false,
      show: false,
    },
    fundDialog: {
      show: false,
      amount: ''
    },
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
        if(this.$store.state.user.role !== 'customer'){
          this.userCooperativeHeaders =  [
            {
              text: 'Title',
              value: 'title'
            },
            {
              text: 'Creator',
              value: 'creator',
              sortable: false
            },
            {
              text: 'Amount',
              value: 'amount',
            },
            {
              text: 'Status',
              value: 'status'
            },
            {
              text: 'Progress',
              value: 'progress'
            },
            {
              text: 'Actions',
              value: 'actions',
              sortable: false
            }
          ];
        }
        this.fetchContent();
      }else{
        this.$store.commit('setContentLoaded',false);
      }
    },500);
  },
  computed:{
    validateNewCooperative(){
      return this.cooperativeDialog.name.trim()===''||+this.cooperativeDialog.amount<=0
          ||this.cooperativeDialog.commission===''||+this.cooperativeDialog.days<=0
          ||(!this.cooperativeDialog.allowDaily&&!this.cooperativeDialog.allowWeekly&&!this.cooperativeDialog.allowMonthly)
          ||this.cooperativeDialog.starts==null||this.cooperativeDialog.collectorIds.length<=0||+this.cooperativeDialog.slot<=0;
    },
  },
  methods:{
    joinCooperativeConfirmation(){
      if(this.joinCooperativeDialog.commission <= 0){
        return this.joinCooperative();
      }
      this.customDialog = {
        show: true,
        persistent: true,
        text: `You will be debited ${this.formatPriceV2(this.joinCooperativeDialog.commission)} to join this cooperative. Are you sure you want to continue?`,
        buttons: [
          {
            text: 'Close',
            color: 'red',
            click: ()=>{
              this.customDialog.show = false;
            }
          },
          {
            text: this.$store.state.user.wallet>this.joinCooperativeDialog.commission?'Proceed':'Fund wallet',
            color: 'green',
            click: ()=>{
              this.customDialog.show = false;
              if(this.$store.state.user.wallet<this.joinCooperativeDialog.commission){
                this.fundDialog = {
                  amount: '',
                  show: true
                }
                return;
              }
              this.joinCooperative();
            }
          },
        ]
      };
    },
    getFreeSlots(cooperative){
      let a = cooperative.slot - cooperative.userCooperatives.length;
      return a > 0?a:0;
    },
    joinCooperative(){
      this.joinCooperativeDialog.loading = true;
      fetch(this.$store.state.baseUrl+'cooperative/join',{
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':this.$store.state.jwt
        },
        body: JSON.stringify({
          ...this.joinCooperativeDialog
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.joinCooperativeDialog.loading = false;
        this.customDialog = {
          show: true,
          persistent: true,
          text: data.message,
          icon: data.status===200?'success':'error',
          closeBtn: {
            text: 'Close',
            color: data.status===200?'primary':'red',
            click: ()=>{
              this.customDialog.show = false;
              if(data.status === 200){
                this.fetchContent();
                this.joinCooperativeDialog = {
                  id: null,
                  name: '',
                  amount: '',
                  commission: '',
                  interest: '',
                  slot: '',
                  type: null,
                  starts: '',
                  loading: false,
                  show: false
                }
              }
            }
          }
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
        this.joinCooperativeDialog.loading = false;
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
                this.joinCooperative();
              }
            }
          ]
        };
      });
    },
    openJoinCooperativeDialog(id){
      let cooperative = this.availableCooperatives.find(t=>t.id===id);
      if(cooperative == null){
        return;
      }
      let types = [];
      if(cooperative.allowDaily){
        types.push('Daily');
      }
      if(cooperative.allowWeekly){
        types.push('Weekly');
      }
      if(cooperative.allowMonthly){
        types.push('Monthly');
      }
      this.joinCooperativeDialog = {
        id: cooperative.id,
        name: cooperative.name,
        amount: cooperative.amount,
        commission: cooperative.commission,
        interest: cooperative.interest,
        slot: cooperative.slot,
        types: types,
        type: null,
        starts: cooperative.starts,
        loading: false,
        show: true
      }
    },
    deleteCooperative(id){
      this.$store.commit('setContentLoaded',false);
      fetch(this.$store.state.baseUrl+'cooperative/'+id,{
        method: 'DELETE',
        headers: {
          'Authorization': this.$store.state.jwt
        }
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.$store.commit('setContentLoaded',true);
        if(data.status === 401){
          return this.$router.push('/login?goto='+this.formatPath());
        }
        if(data.status === 403){
          return this.notFound = true;
        }
        this.customDialog = {
          show: true,
          persistent: true,
          text: data.message,
          icon: data.status === 200 ? 'success':'error',
          buttons: [
            {
              text: 'Close',
              color: data.status === 200 ? 'primary':'red',
              click: ()=>{
                this.customDialog.show = false;
                if(data.status === 200){
                  this.fetchContent();
                }
              }
            }
          ]
        };
      }).catch(err=>{
        this.$store.commit('setContentLoaded',true);
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
                this.deleteCooperative();
              }
            },
            {
              text: 'Close',
              color: 'red',
              click: ()=>{
                this.customDialog.show = false;
              }
            },
          ]
        };
      });
    },
    deleteCooperativeDialog(id){
      this.customDialog = {
        show: true,
        persistent: true,
        text: 'Are you sure you want to delete this cooperative?',
        icon: '',
        buttons: [
          {
            text: 'Cancel',
            color: 'orange',
            click: ()=>{
              this.customDialog.show = false;
            }
          },

          {
            text: 'Proceed',
            color: 'red',
            click: ()=>{
              this.customDialog.show = false;
              this.deleteCooperative(id);
            }
          },
        ]
      };
    },
    openCooperativeDialog(id){
      if(+id>0){
        let cooperative = this.allCooperatives.find(t=>t.id===id);
        if(cooperative!=null){
          this.cooperativeDialog = {
            show: true,
            id: cooperative.id,
            name: cooperative.name,
            amount: cooperative.amount,
            allowDaily: cooperative.allowDaily,
            allowWeekly: cooperative.allowWeekly,
            allowMonthly: cooperative.allowMonthly,
            collectorIds: cooperative.cooperativeCollectors.map(c=>{
              return c.id;
            }),
            days: cooperative.days,
            starts: this.formatDateOnly(cooperative.startDate),
            commission: cooperative.commission,
            slot: cooperative.slot,
            interest: cooperative.slot
          }
        }
      }else{
        this.cooperativeDialog = {
          show: true,
          id: null,
          name: '',
          amount: '',
          allowDaily: true,
          allowWeekly: false,
          allowMonthly: false,
          collectorIds: [],
          days: '',
          starts: null,
          commission: '',
          interest: '',
          slot: ''
        }
      }
    },
    postCooperative(){
      if(!this.$refs.form.validate()){
        return;
      }
      this.newCooperativeLoading = true;
      fetch(this.$store.state.baseUrl+'cooperative',{
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':this.$store.state.jwt
        },
        body: JSON.stringify({
          ...this.cooperativeDialog
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.newCooperativeLoading = false;
        this.customDialog = {
          show: true,
          persistent: true,
          text: data.message,
          icon: data.status===200?'success':'error',
          closeBtn: {
            text: 'Close',
            color: data.status===200?'primary':'red',
            click: ()=>{
              this.customDialog.show = false;
              if(data.status === 200){
                this.fetchContent();
                this.cooperativeDialog = {
                  show: false,
                  id: null,
                  name: '',
                  amount: '',
                  allowDaily: true,
                  allowWeekly: false,
                  allowMonthly: false,
                  collectorIds: [],
                  days: '',
                  starts: null,
                  commission: '',
                  interest: '',
                  slot: ''
                }
              }
            }
          }
        };
      }).catch(err=>{
        this.newCooperativeLoading = false;
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
                this.postCooperative();
              }
            }
          ]
        };
      });
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
        buttons: [
          {
            text: 'View',
            color: 'green',
            click: ()=>{
              this.$router.push('/cooperatives/'+t.ref);
            }
          }
        ],

      }
    },
    formatCooperative(t){
      let tt = {
        ...t,
        name: t.name,
        id: t.id,
        status: t.status===1?'Completed':(new Date(t.startDate) > new Date()?'Not started':'Ongoing'),
        amount: t.amount,
        starts: this.formatDateOnly(t.startDate),
        updatedAt: this.formatDate(t.updatedAt),
        days: t.days,
        buttons: [
          {
            text: 'View',
            color: 'green',
            click: ()=>{

            }
          }
        ]
      }
      if(t.userCooperatives.length <= 0){
        tt.buttons.push({
          text: 'Edit',
          color: 'blue',
          click: ()=>{
            this.openCooperativeDialog(t.id);
          }
        });
        tt.buttons.push({
          text: 'Delete',
          color: 'red',
          click: ()=>{
            this.deleteCooperativeDialog(t.id);
          }
        });
      }
      return tt;
    },
    formatCooperativeAdminColor(status){
      let p = status;
      if(p === 'Completed'){
        return 'green';
      }
      if(p === 'Ongoing'){
        return 'blue';
      }
      return 'orange';
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
      this.loadContent('page/cooperatives').then(data=>{
        if(data.status === 200){
          this.loadingContent = false;
          this.activeCooperatives = data.userCooperatives.filter(t=>t.status===1).map(t=>{
            return this.formatUserCooperative(t);
          });
          this.availableCooperatives = data.cooperatives.filter(t=>t.status===0).map(t=>{
            return this.formatCooperative(t);
          });
          this.userCooperatives = data.userCooperatives.map(t=>{
            return this.formatUserCooperative(t);
          });
          this.allCooperatives = data.cooperatives.map(t=>{
            return this.formatCooperative(t);
          });
          this.collectors = data.collectors.map(c=>{
            return {
              id: c.id,
              name: this.toFirstUpper(c.firstName)+' '+this.toFirstUpper(c.lastName)
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
  }
}
</script>

<style scoped>

</style>