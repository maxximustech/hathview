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
                    <h4 class="text-subtitle-1 font-weight-bold align-self-center">Active thrifts</h4>
                    <v-spacer/>
                  </div>
                  <div v-if="activeThrifts.length>0">
                    <Flicking :options="{align: 'prev'}" class="">
                      <div class="px-1 panel" v-for="slide in activeThrifts">
                        <v-card flat height="120" width="150" class="pa-0 rounded-xl">
                          <v-card-text style="height: 100%;" class="pa-3 d-flex flex-column">
                            <div>
                              <v-chip dark light x-small :color="formatThriftBadgeColor(slide.status)"><span>{{slide.status.split('').map((s,i)=>i===0?s.toUpperCase():s).join('')}}</span></v-chip>
                            </div>
                            <h4 class="text-subtitle-1 font-weight-medium text--white mb-2 text-truncate">
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
                    </Flicking>
                  </div>
                  <div v-else>
                    <v-row>
                      <v-col cols="12" class="text-center">
                        <h4 class="text-h6 font-weight-bold">You have no active thrift</h4>
                      </v-col>
                    </v-row>
                  </div>
                </div>
                <div v-if="$store.state.user.role === 'customer'">
                  <div class="d-flex mb-2 mt-3">
                    <h4 class="text-subtitle-1 font-weight-bold align-self-center">Available thrifts</h4>
                    <v-spacer/>
                  </div>
                  <div v-if="availableThrifts.length>0">
                    <Flicking :options="{align: 'prev'}" class="">
                      <div class="px-1" v-for="(thrift,i) in availableThrifts" :key="i">
                        <v-card color="white" class="rounded-xl pa-5" flat>
                          <v-card-text class="ma-0 pa-0">
                            <v-chip color="blue" x-small class="pa-2 white--text">
                              {{thrift.status}}
                            </v-chip>
                          </v-card-text>
                          <v-card-title class="ma-0 pa-0 text-subtitle-1">
                            {{thrift.name}}
                          </v-card-title>
                          <v-card-text class="ma-0 pa-0">
                            <h6 class="text-h5 font-weight-bold">{{formatPriceV2(thrift.amount)}}</h6>
                            <h6 class="text-subtitle-2">Starts: {{thrift.starts}}</h6>
                          </v-card-text>
                          <v-card-actions class="ma-0 pa-0">
                            <v-spacer/>
                            <v-btn plain small color="green" @click="openJoinThriftDialog(thrift.id)">
                              Join
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </div>
                    </Flicking>
                  </div>
                  <div v-else>
                    <v-row>
                      <v-col cols="12" class="text-center">
                        <h4 class="text-h6 font-weight-bold">You have no available thrift</h4>
                      </v-col>
                    </v-row>
                  </div>
                </div>
                <div>
                  <v-card-title>
                    <span class="text-subtitle-1 font-weight-bold align-self-end">{{$store.state.user.role === 'customer'?'My':'User'}} thrifts</span>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="userThriftSearch"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field>
                  </v-card-title>
                  <v-data-table
                      :loading="loadingContent"
                      :headers="userThriftHeaders"
                      :items="userThrifts"
                      :search="userThriftSearch"
                      no-data-text="No thrift available yet"
                      no-results-text="Thrift could not be found, try another keyword"
                  >
                    <template v-slot:item.amount="{ item }">
                      <span>
                        {{ formatPriceV2(item.amount) }}
                      </span>
                    </template>
                    <template v-slot:item.progress="{ item }">
                      <v-progress-linear striped rounded :value="+item.progress" :color="formatThriftCardColor(item.progress)" background-color="grey lighten-1"></v-progress-linear>
                    </template>
                    <template v-slot:item.status="{ item }">
                      <v-chip
                          small
                          :color="formatThriftBadgeColor(item.status)"
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
                <div v-if="$store.state.user.role === 'admin'">
                  <div class="d-flex mt-10 mb-n5">
                    <v-spacer/>
                    <v-btn plain :ripple="false" color="primary" @click="openThriftDialog(null)">Create New</v-btn>
                  </div>
                  <v-card-title>
                    <span class="text-subtitle-1 font-weight-bold align-self-end">Admin thrifts</span>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="allThriftSearch"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field>
                  </v-card-title>
                  <v-data-table
                      :loading="loadingContent"
                      :headers="allThriftHeaders"
                      :items="allThrifts"
                      :search="allThriftSearch"
                      no-data-text="No thrift available yet"
                      no-results-text="Thrift could not be found, try another keyword"
                  >
                    <template v-slot:item.amount="{ item }">
                      <span>
                        {{ formatPriceV2(item.amount) }}
                      </span>
                    </template>
                    <template v-slot:item.status="{ item }">
                      <v-chip
                          small
                          :color="formatThriftAdminColor(item.status)"
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
                      v-model="thriftDialog.show"
                      width="500"
                      persistent
            >
              <v-card class="pa-5">
                <v-card-title>
                  {{+thriftDialog.id<=0?'Create New':'Edit'}} Thrift
                  <v-divider class="ml-3"></v-divider>
                </v-card-title>
                <v-card-text class="pb-0">
                  <v-form ref="form">
                    <v-row>
                      <v-col cols="12">
                        <v-text-field label="Name" v-model="thriftDialog.name" :rules="rules.name" outlined hide-details/>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field label="Amount" type="number" v-model="thriftDialog.amount" :rules="rules.amount" outlined hide-details/>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field label="Commission" type="number" v-model="thriftDialog.commission" :rules="rules.commission" outlined hide-details/>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field label="Days" type="number" v-model="thriftDialog.days" :rules="rules.days" outlined hide-details/>
                      </v-col>
                      <v-col cols="12">
                        <v-checkbox v-model="thriftDialog.allowDaily" color="primary" hide-details label="Allow Daily Collection"></v-checkbox>
                        <v-checkbox v-model="thriftDialog.allowWeekly" color="primary" hide-details label="Allow Weekly Collection"></v-checkbox>
                        <v-checkbox v-model="thriftDialog.allowMonthly" color="primary" hide-details label="Allow Monthly Collection"></v-checkbox>
                      </v-col>
                      <v-col cols="12">
                        <v-dialog
                            ref="newThriftStartsDialog"
                            v-model="newThriftStartsModal"
                            :return-value.sync="thriftDialog.starts"
                            persistent
                            width="290px"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                v-model="thriftDialog.starts"
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
                              v-model="thriftDialog.starts"
                              scrollable
                              :min="new Date().toISOString().slice(0,10)"
                          >
                            <v-spacer></v-spacer>
                            <v-btn
                                text
                                color="red"
                                @click="newThriftStartsModal = false"
                            >
                              Close
                            </v-btn>
                            <v-btn
                                text
                                color="orange"
                                @click="thriftDialog.starts = null"
                            >
                              Clear
                            </v-btn>
                            <v-btn
                                text
                                color="primary"
                                @click="$refs.newThriftStartsDialog.save(thriftDialog.starts)"
                            >
                              OK
                            </v-btn>
                          </v-date-picker>
                        </v-dialog>
                      </v-col>
                      <v-col cols="12">
                        <v-select hide-details label="Select Collectors" v-model="thriftDialog.collectorIds" :items="collectors" multiple item-text="name" item-value="id" :rules="rules.collectors"/>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
                <v-card-actions class="mt-3">
                  <v-spacer></v-spacer>
                  <v-btn
                      color="red"
                      text
                      @click="thriftDialog.show = false"
                      :disabled="newThriftLoading"
                  >
                    Close
                  </v-btn>
                  <v-btn plain color="green" class="mr-3"
                         :disabled="validateNewThrift"
                         :loading="newThriftLoading"
                         @click="postThrift">{{+thriftDialog.id<=0?'Create':'Update'}}</v-btn>

                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog style="z-index: 1002;"
                      v-model="joinThriftDialog.show"
                      width="500"
                      persistent
            >
              <v-card color="white" class="rounded-xl pa-8" flat>
                <v-card-text class="ma-0 pa-0">
                  <div class="d-flex">
                    <v-spacer/>
                    <div class="d-inline">
                      <div class="text-subtitle-1 font-weight-bold">{{formatPriceV2(joinThriftDialog.commission)}}</div>
                      <div class="green--text text-caption mt-n2">Commission</div>
                    </div>
                  </div>
                </v-card-text>
                <v-card-title class="ma-0 pa-0 text-subtitle-1">
                  {{joinThriftDialog.name}}
                </v-card-title>
                <v-card-text class="ma-0 pa-0">
                  <h6 class="text-h5 font-weight-bold">{{formatPriceV2(joinThriftDialog.amount)}}</h6>
                  <h6 class="text-subtitle-2">{{new Date(joinThriftDialog.starts) < new Date()?'Started':'Starts'}}: {{formatDateOnly(joinThriftDialog.starts)}}</h6>
                  <v-select class="mt-2" flat label="Select collection type" :items="joinThriftDialog.types" v-model="joinThriftDialog.type" hide-details solo outlined/>
                </v-card-text>
                <v-card-actions class="ma-0 pa-0 mt-3">
                  <v-spacer/>
                  <v-btn plain color="red" @click="joinThriftDialog.show = false">
                    Close
                  </v-btn><v-btn plain color="green" :disabled="joinThriftDialog.type==null||new Date(joinThriftDialog.starts) > new Date()" :loading="joinThriftDialog.loading" @click="joinThrift">
                  {{new Date(joinThriftDialog.starts) > new Date()?'Starts soon':'Join'}}
                </v-btn>
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
import Dialog from "@/components/Dialog";
import ContentLoading from "@/components/ContentLoading";
import NotFound from "@/views/NotFound";
export default {
  name: "Thrift",
  components: {NotFound, ContentLoading, Dialog},
  metaInfo(){
    return {
      title: 'Thrift'
    }
  },
  data: ()=>({
    customDialog: undefined,
    activeThrifts: [],
    availableThrifts: [],
    userThrifts: [],
    allThrifts: [],
    thriftDialog: {
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
      commission: ''
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
    newThriftStartsModal: false,
    newThriftLoading: false,
    loadingContent: false,
    s: null,
    userThriftSearch: '',
    allThriftSearch: '',
    userThriftHeaders: [
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
    allThriftHeaders: [
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
    joinThriftDialog: {
      id: null,
      name: '',
      amount: '',
      commission: '',
      type: null,
      starts: '',
      loading: false,
      show: false
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
        if(this.$store.state.user.role !== 'customer'){
          this.userThriftHeaders =  [
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
    validateNewThrift(){
      return this.thriftDialog.name.trim()===''||+this.thriftDialog.amount<=0
          ||this.thriftDialog.commission===''||+this.thriftDialog.days<=0
          ||(!this.thriftDialog.allowDaily&&!this.thriftDialog.allowWeekly&&!this.thriftDialog.allowMonthly)
      ||this.thriftDialog.starts==null||this.thriftDialog.collectorIds.length<=0;
    },
  },
  methods:{
    joinThrift(){
      this.joinThriftDialog.loading = true;
      fetch(this.$store.state.baseUrl+'thrift/join',{
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':this.$store.state.jwt
        },
        body: JSON.stringify({
          ...this.joinThriftDialog
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.joinThriftDialog.loading = false;
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
                this.joinThriftDialog = {
                  id: null,
                  name: '',
                  amount: '',
                  commission: '',
                  type: null,
                  starts: '',
                  loading: false,
                  show: false
                }
              }
            }
          }
        };
      }).catch(err=>{
        this.joinThriftDialog.loading = false;
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
                this.joinThrift();
              }
            }
          ]
        };
      });
    },
    openJoinThriftDialog(id){
      let thrift = this.availableThrifts.find(t=>t.id===id);
      if(thrift == null){
        return;
      }
      let types = [];
      if(thrift.allowDaily){
        types.push('Daily');
      }
      if(thrift.allowWeekly){
        types.push('Weekly');
      }
      if(thrift.allowMonthly){
        types.push('Monthly');
      }
      this.joinThriftDialog = {
        id: thrift.id,
        name: thrift.name,
        amount: thrift.amount,
        commission: thrift.commission,
        types: types,
        type: null,
        starts: thrift.starts,
        loading: false,
        show: true
      }
    },
    deleteThrift(id){
      this.$store.commit('setContentLoaded',false);
      fetch(this.$store.state.baseUrl+'thrift/'+id,{
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
                this.deleteThrift();
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
    deleteThriftDialog(id){
      this.customDialog = {
        show: true,
        persistent: true,
        text: 'Are you sure you want to delete this thrift?',
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
              this.deleteThrift(id);
            }
          },
        ]
      };
    },
    openThriftDialog(id){
      if(+id>0){
        let thrift = this.allThrifts.find(t=>t.id===id);
        if(thrift!=null){
          this.thriftDialog = {
            show: true,
            id: thrift.id,
            name: thrift.name,
            amount: thrift.amount,
            allowDaily: thrift.allowDaily,
            allowWeekly: thrift.allowWeekly,
            allowMonthly: thrift.allowMonthly,
            collectorIds: thrift.thriftCollectors.map(c=>{
              return c.id;
            }),
            days: thrift.days,
            starts: this.formatDateOnly(thrift.startDate),
            commission: thrift.commission
          }
        }
      }else{
        this.thriftDialog = {
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
          commission: ''
        }
      }
    },
    postThrift(){
      if(!this.$refs.form.validate()){
        return;
      }
      this.newThriftLoading = true;
      fetch(this.$store.state.baseUrl+'thrift',{
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':this.$store.state.jwt
        },
        body: JSON.stringify({
          ...this.thriftDialog
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.newThriftLoading = false;
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
                this.thriftDialog = {
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
                  commission: ''
                }
              }
            }
          }
        };
      }).catch(err=>{
        this.newThriftLoading = false;
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
                this.postThrift();
              }
            }
          ]
        };
      });
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
    },
    formatThrift(t){
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
      if(t.userThrifts.length <= 0){
        tt.buttons.push({
            text: 'Edit',
            color: 'blue',
            click: ()=>{
              this.openThriftDialog(t.id);
            }
        });
        tt.buttons.push({
            text: 'Delete',
            color: 'red',
            click: ()=>{
              this.deleteThriftDialog(t.id);
            }
        });
      }
      return tt;
    },
    formatThriftAdminColor(status){
      let p = status;
      if(p === 'Completed'){
        return 'green';
      }
      if(p === 'Ongoing'){
        return 'blue';
      }
      return 'orange';
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
      this.loadContent('page/thrifts').then(data=>{
        if(data.status === 200){
          this.loadingContent = false;
          this.activeThrifts = data.userThrifts.filter(t=>t.status===1).map(t=>{
            return this.formatUserThrift(t);
          });
          this.availableThrifts = data.thrifts.filter(t=>t.status===0).map(t=>{
            return this.formatThrift(t);
          });
          this.userThrifts = data.userThrifts.map(t=>{
            return this.formatUserThrift(t);
          });
          this.allThrifts = data.thrifts.map(t=>{
            return this.formatThrift(t);
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