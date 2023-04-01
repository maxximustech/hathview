<template>
  <v-app>
    <v-main class="add-mt px-0 px-md-3 grey lighten-4">
      <v-row class="px-0">
        <v-col class="col-12">
          <v-card flat color="transparent" class="">
            <v-card-text class="px-0">
              <div v-if="!$store.state.contentLoaded">
                <ContentLoading/>
              </div>
              <div v-else-if="loadingContent">
                <v-row class="mt-5">
                  <v-col cols="12"
                         v-for="i in 5"
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
                <v-text-field v-model="searchInput" :loading="searchLoading" solo rounded class="rounded-xl mb-5" flat label="Search a user by name or email" hide-details clearable append-icon="mdi-magnify"/>
                <div class="d-flex mb-2 mt-3">
                  <h6 class="text-h6 font-weight-medium mb-2">All Users</h6>
                  <v-spacer/>
                  <v-btn plain :ripple="false" v-if="this.$store.state.user.role === 'admin'" color="primary" @click="openNewUserDialog" :loading="newUserloading">Create New</v-btn>
                </div>
                <div v-if="customers.length <= 0" class="text-center my-10">
                  <h6 class="text-subtitle-1 text-md-h6" style="font-weight: 600;">User list is empty</h6>
                </div>
                <v-virtual-scroll v-if="searchResult.length > 0" :bench="searchResult.length>100?100:searchResult.length" :items="searchResult" :item-height="85" height="500">
                  <template v-slot:default="{item}">
                    <v-list-item v-if="typeof item.no_result === 'undefined'" v-ripple class="rounded-xl px-6 py-2" style="background-color: white;">
                      <v-list-item-avatar>
                        <v-avatar color="primary" size="40">
                          <v-img v-if="typeof item.imageUrl === 'string' && item.imageUrl !== ''" :src="item.imageUrl"/>
                          <span class="font-weight-medium white--text" v-if="typeof item.imageUrl !== 'string' || item.imageUrl === ''">{{toFirstUpper(item.firstName).split('')[0]}}</span>
                        </v-avatar>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title class="">{{toFirstUpper(item.firstName)+' '+toFirstUpper(item.lastName)}}</v-list-item-title>
                        <v-list-item-subtitle class="">{{toFirstUpper(item.role)}}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-list-item-action-text>
                          <v-btn plain color="primary" @click="viewUserDetails(item.id)">View</v-btn>
                        </v-list-item-action-text>
                      </v-list-item-action>
                    </v-list-item>
                    <v-list-item v-else>
                      <v-list-item-content>
                        <v-list-item-title class="text-center">
                          <h6 class="text-subtitle-1 text-md-h6" style="font-weight: 600;">No user found</h6>
                          <h6 class="text-subtitle-2 text-md-subtitle-2" style="font-weight: 500;">Please try another keyword</h6>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-virtual-scroll>
                <v-virtual-scroll v-else :bench="customers.length>100?100:customers.length" :items="customers" :item-height="85" height="500">
                  <template v-slot:default="{item}">
                    <v-list-item v-if="typeof item.no_result === 'undefined'" v-ripple class="rounded-xl px-6 py-2" style="background-color: white;">
                      <v-list-item-avatar>
                        <v-avatar color="primary" size="40">
                          <v-img v-if="typeof item.imageUrl === 'string' && item.imageUrl !== ''" :src="item.imageUrl"/>
                          <span class="font-weight-medium white--text" v-if="typeof item.imageUrl !== 'string' || item.imageUrl === ''">{{toFirstUpper(item.firstName).split('')[0]}}</span>
                        </v-avatar>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title class="">{{toFirstUpper(item.firstName)+' '+toFirstUpper(item.lastName)}}</v-list-item-title>
                        <v-list-item-subtitle class="">{{toFirstUpper(item.role)}}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-list-item-action-text>
                          <v-btn plain color="primary" @click="viewUserDetails(item.id)">View</v-btn>
                        </v-list-item-action-text>
                      </v-list-item-action>
                    </v-list-item>
                    <v-list-item v-else>
                      <v-list-item-content>
                        <v-list-item-title class="text-center">
                          <h6 class="text-subtitle-1 text-md-h6" style="font-weight: 600;">No user found</h6>
                          <h6 class="text-subtitle-2 text-md-subtitle-2" style="font-weight: 500;">Please try another keyword</h6>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-virtual-scroll>

                <v-dialog style="z-index: 1002;"
                          v-model="newUserDialog.show"
                          width="500"
                          persistent
                >
                  <v-card class="pa-5">
                    <v-card-title>
                      Create New Account
                      <v-divider class="ml-3"></v-divider>
                    </v-card-title>
                    <v-card-text class="pb-0">
                      <v-form ref="form">
                        <v-row>
                          <v-col cols="12">
                            <v-text-field label="First name" v-model="newUserDialog.firstName" :rules="rules.firstName" outlined hide-details/>
                          </v-col>
                          <v-col cols="12">
                            <v-text-field label="Last name" v-model="newUserDialog.lastName" :rules="rules.lastName" outlined hide-details/>
                          </v-col>
                          <v-col cols="12">
                            <v-text-field label="Phone" type="tel" v-model="newUserDialog.phone" :rules="rules.phone" outlined hide-details/>
                          </v-col>
                          <v-col cols="12">
                            <v-text-field label="Email address" type="email" v-model="newUserDialog.email" outlined hide-details/>
                          </v-col>
                          <v-col cols="12">
                            <v-select label="Choose a role" type="email" :items="roles" v-model="newUserDialog.role" :rules="rules.role" item-value="value" item-text="name" outlined hide-details/>
                          </v-col>
                          <v-col cols="12">
                            <v-text-field label="Password" v-model="newUserDialog.password" :rules="rules.newPassword" outlined hide-details>
                              <template v-slot:append>
                                <v-btn outlined class="align-self-center mt-n2" color="primary" @click="newUserDialog.password = generateRandomString(10)">Generate</v-btn>
                              </template>
                            </v-text-field>
                          </v-col>
                        </v-row>
                      </v-form>
                    </v-card-text>
                    <v-card-actions class="mt-3">
                      <v-spacer></v-spacer>
                      <v-btn
                          color="red"
                          text
                          @click="newUserDialog.show = false"
                          :disabled="newUserloading"
                      >
                        Close
                      </v-btn>
                      <v-btn plain color="green" class="mr-3"
                             :disabled="validateNewUser"
                             :loading="newUserloading"
                             @click="createUser">Create</v-btn>

                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <v-dialog style="z-index: 1002;"
                          value="true"
                          width="500"
                          v-if="viewUserDialog.show"
                >
                  <v-card class="pa-5">
                    <v-card-title>
                      User Details
                      <v-divider class="ml-3"></v-divider>
                    </v-card-title>
                    <v-card-text class="pb-0">
                      <div class="text-center">
                        <v-avatar color="primary lighten-1" size="100">
                          <span v-if="viewUserDialog.imageUrl == null || viewUserDialog.imageUrl.trim() === ''" class="white--text text-h4 font-weight-bold">
                            {{toFirstUpper(viewUserDialog.firstName.split('')[0])+toFirstUpper(viewUserDialog.lastName.split('')[0])}}
                          </span>
                          <v-img v-if="viewUserDialog.imageUrl != null && viewUserDialog.imageUrl.trim() !== ''" :src="viewUserDialog.imageUrl"/>
                        </v-avatar>
                        <h4 class="text-subtitle-2 font-weight-bold mt-2">{{toFirstUpper(viewUserDialog.firstName)+' '+toFirstUpper(viewUserDialog.lastName)}}</h4>
                        <h6 class="text-caption font-weight-medium primary--text mt-n1 mb-1">{{toFirstUpper(viewUserDialog.role)}}</h6>
                      </div>
                      <v-row>
                        <v-col cols="12">
                          <h6 class="text-subtitle-2">User ID: {{viewUserDialog.regId}}</h6>
                          <h6 class="text-subtitle-2">Wallet balance: {{formatPriceV2(viewUserDialog.wallet)}}</h6>
                          <h6 class="text-subtitle-2">Outstanding loan: {{formatPriceV2(viewUserDialog.outstandingLoan)}}</h6>
                          <h6 class="text-subtitle-2">Date registered: {{formatDate(viewUserDialog.regdate)}}</h6>
                          <h6 class="text-subtitle-2">Last login: {{formatDate(viewUserDialog.lastlogin)}}</h6>
                        </v-col>
                      </v-row>
                    </v-card-text>
                    <v-card-actions class="mt-3">
                      <v-spacer></v-spacer>
                      <v-btn
                          color="red"
                          text
                          @click="closeViewUser"
                      >
                        Close
                      </v-btn>
                      <v-btn plain color="green" class="mr-3"
                             :to="'/user/'+viewUserDialog.regId">Go to profile</v-btn>

                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
    <Dialog :dialog="customDialog"/>
  </v-app>
</template>

<script>
import ContentLoading from "@/components/ContentLoading";
import NotFound from "@/views/NotFound";
import Dialog from "@/components/Dialog";
export default {
  name: "Customers",
  components: {Dialog, NotFound, ContentLoading},
  metaInfo(){
    return {
      title: 'Users'
    }
  },
  data: ()=>({
    customers: [],
    newUserDialog: {
      show: false,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confPassword: '',
      phone: '',
      role: 'customer'
    },
    rules:{
      email: [
        v => !!v || 'E-mail is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
      firstName: [
        v => !!v || 'First Name is required',
        v => (v && v.length > 2) || 'First Name must be greater than 2 characters',
      ],
      lastName: [
        v => !!v || 'Last Name is required',
        v => (v && v.length > 2) || 'Last Name must be greater than 2 characters',
      ],
      phone: [
        v => !!v || 'Phone number is required',
        v => /^[+]*[(]?\d{1,4}[)]?[-\s/\d]*$/.test(v) || 'Phone number must be valid',
      ],
      newPassword: [
        v => !!v || 'Password is required',
      ],
      role: [
        v => !!v || 'Please choose a role',
      ],
    },
    newUserloading: false,
    viewUserDialog: {
      show: false,
      firstName: null,
      lastName: null,
      lastlogin: null,
      regdate: null,
      wallet: 0,
      role: '',
      regId: '',
      outstandingLoan: 0,
      imageUrl: null
    },
    searchInput: '',
    searchResult: [],
    searchLoading: false,
    notFound: false,
    customDialog: undefined,
    s: null,
    roles: [
      {
        name: 'Customer',
        value: 'customer'
      },
      {
        name: 'Collector',
        value: 'collector'
      }
    ],
    loadingContent: false
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
        if(this.$store.state.user.role === 'customer'){
          this.loadingContent = false;
          this.notFound = true;
          return;
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
  computed:{
    validateNewUser(){

    },
  },
  methods: {
    execSearch(){
      if(this.searchInput == null || this.searchInput.trim().length < 3){
        this.searchResult = [];
        return;
      }
      this.searchLoading = true;
      this.loadContent('search/users/'+this.searchInput.trim()).then(data=>{
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
    closeViewUser(){
      this.viewUserDialog = {
        show: false,
        firstName: null,
        lastName: null,
        lastlogin: null,
        regdate: null,
        wallet: 0,
        role: '',
        regId: '',
        outstandingLoan: 0,
        imageUrl: null
      }
    },
    viewUserDetails(id){
      let u = this.customers.find(c=>c.id===id);
      if(u == null){
        return;
      }
      let outstandingLoan = 0;
      u.thriftLoans.forEach(loan=>{
        outstandingLoan += loan.amount - loan.paid;
      });
      u.cooperativeLoans.forEach(loan=>{
        outstandingLoan += loan.amount - loan.paid;
      });
      this.viewUserDialog = {
        ...u,
        show: true,
        outstandingLoan: outstandingLoan
      }
    },
    openNewUserDialog(){
      this.newUserDialog = {
        show: true,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'customer',
        phone: ''
      }
    },
    createUser(){
      if(!this.$refs.form.validate()){
        return;
      }
      this.newUserloading = true;
      fetch(this.$store.state.baseUrl+'auth',{
        method: 'PUT',
        headers:{
          'Content-Type':'application/json',
          'Authorization':this.$store.state.jwt
        },
        body: JSON.stringify({
          ...this.newUserDialog
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.newUserloading = false;
        this.customDialog = {
          show: true,
          persistent: true,
          text: data.message,
          icon: data.status===201?'success':'error',
          closeBtn: {
            text: 'Close',
            color: data.status===201?'primary':'red',
            click: ()=>{
              this.customDialog.show = false;
              if(data.status === 201){
                this.fetchContent();
                this.newUserDialog = {
                  show: false,
                  firstName: '',
                  lastName: '',
                  email: '',
                  password: '',
                  confPassword: '',
                  phone: '',
                  role: 'customer'
                }
              }
            }
          }
        };
      }).catch(err=>{
        this.newUserloading = false;
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
                this.createUser();
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
      this.loadContent('users').then(data=>{
        if(data.status === 200){
          this.loadingContent = false;
          this.customers = data.users;
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