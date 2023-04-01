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
              <div v-else-if="showLoader">
                <v-skeleton-loader class="mb-4" type="image"/>
                <v-skeleton-loader type="article, article, article, actions"/>
              </div>
              <div v-else-if="notFound">
                <NotFound/>
              </div>
              <div v-else>
                <v-row>
                  <v-col cols="12">
                    <v-card flat color="transparent">
                      <v-card-text class="pa-0 ma-0">
                        <div class="text-center">
                          <v-avatar color="primary lighten-1" size="100">
                            <v-img v-if="typeof user.imageUrl === 'string' && user.imageUrl !== ''" :src="user.imageUrl"/>
                            <span class="font-weight-medium text-h4 white--text" v-if="typeof user.imageUrl !== 'string' || user.imageUrl === ''">{{toFirstUpper(user.firstName).split('')[0]+toFirstUpper(user.lastName).split('')[0]}}</span>
                            <div style="width: 100%; height: 100%; position: absolute;" class="d-flex justify-center">
                              <v-btn icon plain :ripple="false" class="align-self-center" :loading="imageLoading" @click="setUpImageUploader">
                                <v-icon size="30">mdi-camera</v-icon>
                              </v-btn>
                            </div>
                          </v-avatar>
                          <h4 class="text-subtitle-2 font-weight-bold mt-2">{{toFirstUpper(user.firstName)+' '+toFirstUpper(user.lastName)}}</h4>
                          <h6 class="text-caption font-weight-medium primary--text mt-n1 mb-1">{{toFirstUpper(user.role)}}</h6>
                          <h6 class="text-subtitle-1 font-weight-bold primary--text mt-n1 mb-1">{{formatPriceV2(user.wallet)}}</h6>
                          <div class="d-flex justify-center">
                            <v-btn color="green" rounded outlined small class="mr-3" @click="fundDialog.show=true">Add fund</v-btn>
                            <v-btn color="primary" rounded outlined small @click="withdrawDialog.show=true">Withdraw</v-btn>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12">
                    <v-card
                        flat class="rounded-xl sidebar__inner pa-8"
                    >
                      <div class="px-3">
                        <v-form ref="form">
                          <v-row>
                            <v-col cols="12" class="mt-4">
                              <h4 class="text-h6 font-weight-bold">Personal Information</h4>
                            </v-col>
                            <v-col cols="12" sm="6">
                              <v-text-field label="First name" v-model="user.firstName" :rules="rules.firstName" :readonly="$store.state.user.role==='customer'" outlined hide-details/>
                            </v-col>
                            <v-col cols="12" sm="6">
                              <v-text-field label="Last name" v-model="user.lastName" :rules="rules.lastName" :readonly="$store.state.user.role==='customer'" outlined hide-details/>
                            </v-col>
                            <v-col cols="12" sm="6">
                              <v-text-field label="Phone" type="tel" v-model="user.phone" :rules="rules.phone" :readonly="$store.state.user.role==='customer'" outlined hide-details/>
                            </v-col>
                            <v-col cols="12" sm="6">
                              <v-text-field label="Email address" type="email" v-model="user.email" :readonly="$store.state.user.role==='customer'" outlined hide-details>
                              </v-text-field>
                            </v-col>
                            <v-col cols="12" class="mt-4">
                              <h4 class="text-h6 font-weight-bold">Payment Information</h4>
                            </v-col>
                            <v-col cols="12">
                              <v-radio-group v-model="user.payMethod" :readonly="$store.state.user.role==='customer'" label="Payment method">
                                <v-radio value="cash" label="Cash"/>
                                <v-radio value="bank" label="Bank Transfer"/>
                              </v-radio-group>
                            </v-col>
                            <v-col v-if="user.payMethod==='bank'" cols="12" sm="6">
                              <v-text-field label="Bank name" v-model="user.bank_name" :readonly="$store.state.user.role==='customer'" outlined hide-details/>
                            </v-col>
                            <v-col v-if="user.payMethod==='bank'" cols="12" sm="6">
                              <v-text-field label="Account name" v-model="user.account_name" :readonly="$store.state.user.role==='customer'" outlined hide-details/>
                            </v-col>
                            <v-col v-if="user.payMethod==='bank'" cols="12" sm="6">
                              <v-text-field label="Account number" v-model="user.account_no" :readonly="$store.state.user.role==='customer'" outlined hide-details/>
                            </v-col>
                            <v-col cols="12" class="text-center" v-if="$store.state.user.role!=='customer'">
                              <v-btn color="primary" outlined class="mr-3" :disabled="validateBtn" :loading="loading" @click="updateData">Update</v-btn>
                              <v-btn color="orange" outlined @click="openPasswordDialog">Change Password</v-btn>
                            </v-col>
                          </v-row>
                        </v-form>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>

                <Dialog :dialog="customDialog"/>
                <v-dialog style="z-index: 1002;"
                          v-model="emailDialog.show"
                          width="500"
                          persistent
                >
                  <v-card class="pa-5">
                    <v-card-title>
                      Change Email Address
                      <v-divider></v-divider>
                    </v-card-title>
                    <v-card-text class="pb-0">
                      <slide-x-left-transition appear mode="out-in" :delay="0.25">
                        <div v-if="emailDialog.curStep === 0">
                          <v-form ref="emailForm">
                            <v-text-field outlined label="New Email Address" :rules="rules.email" type="email" v-model="emailDialog.email"></v-text-field>
                          </v-form>
                        </div>
                        <div v-if="emailDialog.curStep === 1">
                          <v-form ref="otpForm">
                            <h6 class="text-subtitle-2">A code was sent to your email address, please enter the code below</h6>
                            <v-otp-input
                                v-model="emailDialog.otp"
                                :light="!$vuetify.theme.dark"
                                length="6"
                                @finish="confirmEmail"
                                type="tel">
                            </v-otp-input>
                          </v-form>
                          <div class="text-end">
                            <v-btn small plain
                                   :ripple="false"
                                   class="mt-n3"
                                   :disabled="resendAfter>0"
                                   :loading="emailLoading"
                                   @click="changeEmail(true)"
                                   style="font-weight: 700;">
                              Resend {{resendAfter>0?'in '+resendAfter+'s':'code'}}
                            </v-btn>
                          </div>
                        </div>
                      </slide-x-left-transition>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                          color="red"
                          text
                          @click="emailDialog.show = false"
                          :disabled="confirmLoading||emailLoading"
                      >
                        Close
                      </v-btn>
                      <v-btn
                          color="primary"
                          text
                          v-if="emailDialog.curStep === 0"
                          @click="changeEmail(false)"
                          :disabled="emailDialog.email == null || emailDialog.email.trim() === ''||confirmLoading"
                          :loading="emailLoading"
                      >
                        Change
                      </v-btn>
                      <v-btn
                          color="primary"
                          text
                          v-if="emailDialog.curStep === 1"
                          @click="confirmEmail"
                          :disabled="emailDialog.otp == null || emailDialog.otp.trim().length < 6||emailLoading"
                          :loading="confirmLoading"
                      >
                        Confirm
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <v-dialog style="z-index: 1002;"
                          v-model="password.show"
                          width="500"
                          persistent
                >
                  <v-card class="pa-5">
                    <v-card-title>
                      Change Password
                      <v-divider></v-divider>
                    </v-card-title>
                    <v-card-text class="pb-0">
                      <slide-x-left-transition appear mode="out-in" :delay="0.25">
                        <div v-if="password.curStep === 0">
                          <v-form ref="passwordForm">
                            <v-text-field v-if="!password.otpValid&&$store.state.user.id===user.id" outlined label="Current Password" :rules="rules.oldPassword" type="password" v-model="password.oldPassword"></v-text-field>
                            <v-text-field outlined label="New Password" :rules="[v => !!v || 'Password is required',newPassShort(),newPassLong()]" type="password" v-model="password.newPassword"></v-text-field>
                            <v-text-field outlined label="Confirm New Password" :rules="[v => !!v || 'Password is required', doesNewPassMatch()]" type="password" v-model="password.confNewPassword"></v-text-field>
                            <v-radio-group label="Log me out of all devices?" v-model="password.deleteSessions">
                              <v-radio label="Yes" :value="true"/>
                              <v-radio label="No" :value="false"/>
                            </v-radio-group>
                            <div v-if="!password.otpValid" class="text-end">
                              <v-btn small plain
                                     :ripple="false"
                                     class="mt-n3"
                                     :loading="forgotPasswordLoading"
                                     @click="forgotPassword(false)"
                                     style="font-weight: 700;">
                                Forgot Password?
                              </v-btn>
                            </div>
                          </v-form>
                        </div>
                        <div v-if="password.curStep === 1">
                          <v-form ref="passwordOtpForm">
                            <h6 class="text-subtitle-2">A code was sent to your email address, please enter the code below</h6>
                            <v-otp-input
                                v-model="password.otp"
                                :light="!$vuetify.theme.dark"
                                length="6"
                                @finish="confirmForgotPassword"
                                type="tel">
                            </v-otp-input>
                          </v-form>
                          <div class="text-end">
                            <v-btn small plain
                                   :ripple="false"
                                   class="mt-n3"
                                   :disabled="passwordResendAfter>0"
                                   :loading="forgotPasswordLoading"
                                   @click="forgotPassword(true)"
                                   style="font-weight: 700;">
                              Resend {{passwordResendAfter>0?'in '+passwordResendAfter+'s':'code'}}
                            </v-btn>
                          </div>
                        </div>
                      </slide-x-left-transition>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                          color="red"
                          text
                          @click="password.show = false"
                          :disabled="forgotPasswordLoading||confirmPasswordLoading||changePasswordLoading"
                      >
                        Close
                      </v-btn>
                      <v-btn
                          color="primary"
                          text
                          v-if="password.curStep === 0"
                          @click="changePassword"
                          :disabled="password.newPassword.trim() == '' || password.confNewPassword.trim() === ''||(!password.otpValid && password.oldPassword.trim() === ''&&$store.state.user.id===user.id)"
                          :loading="changePasswordLoading"
                      >
                        Change
                      </v-btn>
                      <v-btn
                          color="primary"
                          text
                          v-if="password.curStep === 1"
                          @click="confirmForgotPassword"
                          :disabled="password.otp == null || password.otp.trim().length < 6||forgotPasswordLoading"
                          :loading="confirmPasswordLoading"
                      >
                        Confirm
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <FundWallet :user="{...user}" :dialog="fundDialog" @success="fetchContent"/>
                <Withdraw :user="{...user}" :dialog="withdrawDialog" @success="fetchContent"/>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
import EditProfile from "@/components/EditProfile";
import {SlideYUpTransition,SlideXLeftTransition} from 'vue2-transitions';
import ContentLoading from "@/components/ContentLoading";
import NotFound from "@/views/NotFound";
import Dialog from "@/components/Dialog";
import FundWallet from "@/components/FundWallet";
import Withdraw from "@/components/Withdraw";
export default {
  name: "SingleUser",
  components: {
    Withdraw,
    FundWallet, Dialog, NotFound, ContentLoading, EditProfile,SlideYUpTransition,SlideXLeftTransition},
  metaInfo(){
    return {
      title: this.title
    }
  },
  destroyed() {
    try{
      clearInterval(this.s);
    }catch(e){

    }
  },
  created(){
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
  data: ()=>({
    showLoader: true,
    customDialog: undefined,
    user: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      payMethod: '',
      bank_name: '',
      account_name: '',
      account_no: ''
    },
    email: '',
    password: {
      newPassword: '',
      confNewPassword: '',
      oldPassword: '',
      show: false,
      otp: '',
      otpValid: false,
      curStep: 0,
      deleteSessions: false
    },
    s: null,
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
      oldPassword: [
        v => !!v || 'Password is required',
      ],
    },
    emailDialog: {
      show: false,
      curStep: 0,
      otp: '',
      email: ''
    },
    loading: false,
    emailLoading: false,
    confirmLoading: false,
    forgotPasswordLoading: false,
    confirmPasswordLoading: false,
    changePasswordLoading: false,
    resendAfter: 60,
    passwordResendAfter: 60,
    t: null,
    u: null,
    passwordMinLength: 2,
    passwordMaxLength: 2,
    notFound: false,
    imageLoading: false,
    title: 'Account',
    fundDialog: {
      show: false,
      amount: ''
    },
    withdrawDialog: {
      show: false,
      amount: ''
    },
  }),
  computed:{
    formatRetry(){
      //return this.formatDiscountTime(this.resendAfter);
    },
    validateBtn(){
      return (this.user.firstName.trim() === '' ||
          this.user.lastName.trim() === '' ||
          this.user.phone.trim() === '');
    }
  },
  methods:{
    newPassLong(){
      return this.password.newPassword.length <= this.passwordMaxLength || 'Password should not be greater than '+this.passwordMaxLength+' characters'
    },
    newPassShort(){
      return this.password.newPassword.length >= this.passwordMinLength || 'Password should not be less than '+this.passwordMinLength+' characters'
    },
    doesNewPassMatch(){
      return this.password.confNewPassword === this.password.newPassword || 'New password does not match';
    },
    openPasswordDialog(){
      this.password = {
        newPassword: '',
        confNewPassword: '',
        oldPassword: '',
        show: true,
        otp: '',
        otpValid: false,
        curStep: 0,
        deleteSessions: false
      }
    },
    openEmailDialog(){
      this.emailDialog = {
        show: true,
        curStep: 0,
        otp: '',
        email: ''
      }
    },
    changePassword(){
      if(!this.$refs.passwordForm.validate()){
        return;
      }
      this.changePasswordLoading = true;
      fetch(this.$store.state.baseUrl+'auth/change-password',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt
        },
        body: JSON.stringify({
          newPassword: this.password.newPassword,
          oldPassword: this.password.otpValid?undefined:this.password.oldPassword,
          confNewPassword: this.password.confNewPassword,
          email: this.email,
          code: this.password.otpValid?this.password.otp:undefined,
          deleteSessions: this.password.deleteSessions
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.changePasswordLoading = false;
        if(data.status === 200){
          this.password.show = false
        }
        if(data.status === 401){
          return this.$router.push('/login?goto='+this.formatPath());
        }
        this.customDialog = {
          show: true,
          persistent: true,
          text: data.message,
          icon: data.status===200||data.status===201?'success':'error',
          closeBtn: {
            text: 'Close',
            color: 'red',
            click: ()=>{
              this.customDialog.show = false;
              if(data.status === 200){
                window.location.reload();
              }
            }
          }
        };
      }).catch(err=>{
        this.changePasswordLoading = false;
        this.customDialog = {
          show: true,
          persistent: false,
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
                this.changePassword();
                this.customDialog.show = false;
              }
            }
          ]
        };
      });
    },
    confirmForgotPassword(){
      let override = '';
      if(typeof this.$route.params.ref !== 'undefined' && this.$route.params.ref != null && this.$route.params.ref.toString().trim() !== ''){
        override = '?override='+this.$route.params.ref;
      }
      this.confirmPasswordLoading = true;
      fetch(this.$store.state.baseUrl+'auth/otp/'+this.password.otp+'?type=forgot-password&email='+this.email,{
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt
        }
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.confirmPasswordLoading = false;
        if(data.status === 200){
          this.password.curStep = 0;
          this.password.otpValid = true;
        }
        else{
          if(data.status === 401){
            return this.$router.push('/login?goto='+this.formatPath());
          }
          this.customDialog = {
            show: true,
            persistent: true,
            text: data.message,
            icon: data.status===200||data.status===201?'success':'error',
            closeBtn: {
              text: 'Close',
              color: 'red',
              click: ()=>{
                this.customDialog.show = false;
              }
            }
          };
        }
      }).catch(err=>{
        this.confirmPasswordLoading = false;
        this.customDialog = {
          show: true,
          persistent: false,
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
                this.confirmForgotPassword();
                this.customDialog.show = false;
              }
            }
          ]
        };
      });
    },
    forgotPassword(retry=false){
      let override = '';
      if(typeof this.$route.params.ref !== 'undefined' && this.$route.params.ref != null && this.$route.params.ref.toString().trim() !== ''){
        override = '?override='+this.$route.params.ref;
      }
      this.forgotPasswordLoading = true;
      fetch(this.$store.state.baseUrl+'auth/send-code'+override,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt
        },
        body: JSON.stringify({
          email: this.email,
          type: 'forgot-password'
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.forgotPasswordLoading = false;
        if(data.status === 200 || data.status === 201){
          this.password.curStep = 1;
          this.passwordResendAfter = 60;
          let rtEnd = new Date().getTime() + (this.passwordResendAfter * 1000);
          this.u = setInterval(()=>{
            if(this.passwordResendAfter > 0 && Date.now() < rtEnd){
              this.passwordResendAfter = Math.ceil((rtEnd - Date.now())/1000);
            }else{
              this.passwordResendAfter = 0;
              clearInterval(this.u);
            }
          },1000);
          if(retry){
            this.customDialog = {
              show: true,
              persistent: true,
              text: 'Code has been resent successfully!',
              icon: 'success',
              closeBtn: {
                text: 'Close',
                color: 'red',
                click: ()=>{
                  this.customDialog.show = false;
                }
              }
            };
          }
        }else{
          if(data.status === 401){
            return this.$router.push('/login?goto='+this.formatPath());
          }
          this.customDialog = {
            show: true,
            persistent: true,
            text: data.message,
            icon: data.status===200||data.status===201?'success':'error',
            closeBtn: {
              text: 'Close',
              color: 'red',
              click: ()=>{
                this.customDialog.show = false;
              }
            }
          };
        }
      }).catch(err=>{
        this.forgotPasswordLoading = false;
        this.customDialog = {
          show: true,
          persistent: false,
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
                this.forgotPassword(retry);
                this.customDialog.show = false;
              }
            }
          ]
        };
      });
    },
    confirmEmail(){
      let override = '';
      if(typeof this.$route.params.ref !== 'undefined' && this.$route.params.ref != null && this.$route.params.ref.toString().trim() !== ''){
        override = '?override='+this.$route.params.ref;
      }
      this.confirmLoading = true;
      fetch(this.$store.state.baseUrl+'user/confirm-email/'+this.emailDialog.otp+override,{
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt
        }
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.confirmLoading = false;
        if(data.status === 200){
          this.emailDialog.show = false
        }
        if(data.status === 401){
          return this.$router.push('/login?goto='+this.formatPath());
        }
        this.customDialog = {
          show: true,
          persistent: true,
          text: data.message,
          icon: data.status===200||data.status===201?'success':'error',
          closeBtn: {
            text: 'Close',
            color: 'red',
            click: ()=>{
              this.customDialog.show = false;
              if(data.status === 200){
                window.location.reload();
              }
            }
          }
        };
      }).catch(err=>{
        this.confirmLoading = false;
        this.customDialog = {
          show: true,
          persistent: false,
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
                this.confirmEmail();
                this.customDialog.show = false;
              }
            }
          ]
        };
      });
    },
    changeEmail(retry=false){
      if(!retry&&!this.$refs.emailForm.validate()){
        return;
      }
      this.emailDialog.otp = '';
      let override = '';
      if(typeof this.$route.params.ref !== 'undefined' && this.$route.params.ref != null && this.$route.params.ref.toString().trim() !== ''){
        override = '?override='+this.$route.params.ref;
      }
      this.emailLoading = true;
      fetch(this.$store.state.baseUrl+'user/change-email'+override,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt
        },
        body: JSON.stringify({
          email: this.emailDialog.email
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.emailLoading = false;
        if(data.status === 200 || data.status === 201){
          this.emailDialog.curStep = 1;
          this.resendAfter = 60;
          let rtEnd = new Date().getTime() + (this.resendAfter * 1000);
          this.t = setInterval(()=>{
            if(this.resendAfter > 0 && Date.now() < rtEnd){
              this.resendAfter = Math.ceil((rtEnd - Date.now())/1000);
            }else{
              this.resendAfter = 0;
              clearInterval(this.t);
            }
          },1000);
          if(retry){
            this.customDialog = {
              show: true,
              persistent: true,
              text: 'Code has been resent successfully!',
              icon: 'success',
              closeBtn: {
                text: 'Close',
                color: 'red',
                click: ()=>{
                  this.customDialog.show = false;
                }
              }
            };
          }
        }else{
          if(data.status === 401){
            return this.$router.push('/login?goto='+this.formatPath());
          }
          this.customDialog = {
            show: true,
            persistent: true,
            text: data.message,
            icon: data.status===200||data.status===201?'success':'error',
            closeBtn: {
              text: 'Close',
              color: 'red',
              click: ()=>{
                this.customDialog.show = false;
              }
            }
          };
        }
      }).catch(err=>{
        this.emailLoading = false;
        this.customDialog = {
          show: true,
          persistent: false,
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
                this.changeEmail(retry);
                this.customDialog.show = false;
              }
            }
          ]
        };
      });
    },
    fetchContent(){
      this.showLoader = true;
      let override = '';
      if(typeof this.$route.params.ref !== 'undefined' && this.$route.params.ref != null && this.$route.params.ref.toString().trim() !== ''){
        override = '?override='+this.$route.params.ref;
      }
      this.loadContent('auth'+override).then(data=>{
        if(data.status === 200){
          this.user = data.user;
          this.email = data.user.email;
          this.passwordMinLength = data.passwordMinLength;
          this.passwordMaxLength = data.passwordMaxLength;
          this.showLoader = false;
          this.title = this.toFirstUpper(this.user.firstName) + ' ' + this.toFirstUpper(this.user.lastName);
        }else if(data.status === 401){
          return this.$router.push('/login?goto='+this.formatPath());
        }else if(data.status === 403 || data.status === 404){
          this.showLoader = false;
          this.notFound = true;
        }else{
          this.customDialog = {
            show: true,
            persistent: true,
            text: data.message,
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
                  this.fetchContent();
                }
              },
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
                this.fetchContent();
              }
            },
          ]
        };
      })
    },
    updateData(){
      if(!this.$refs.form.validate()){
        return;
      }
      let override = '';
      if(typeof this.$route.params.ref !== 'undefined' && this.$route.params.ref != null && this.$route.params.ref.toString().trim() !== ''){
        override = '?override='+this.$route.params.ref;
      }
      this.loading = true;
      fetch(this.$store.state.baseUrl+'user/edit'+override,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt
        },
        body: JSON.stringify({
          ...this.user,
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.loading = false;
        if(data.status === 200 || data.status === 201){

        }
        if(data.status === 401){
          return this.$router.push('/login?goto='+this.formatPath());
        }
        this.customDialog = {
          show: true,
          persistent: true,
          text: data.message,
          icon: data.status===200||data.status===201?'success':'error',
          closeBtn: {
            text: 'Close',
            color: 'red',
            click: ()=>{
              this.customDialog.show = false;
              if(data.status === 200){
                window.location.reload();
              }
            }
          }
        };
      }).catch(err=>{
        this.loading = false;
        this.customDialog = {
          show: true,
          persistent: false,
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
                this.updateData();
                this.customDialog.show = false;
              }
            }
          ]
        };
      });
    },
    setUpImageUploader(){
      let image;
      let valid = ['gif','jpeg','jpg','png'];
      let input = document.createElement('input');
      input.type = 'file';
      input.accept = "image/jpeg,image/jpg,image/png,image/gif";
      input.onchange = _ => {
        if(typeof input.files !== 'object' || input.files.length <= 0){
          return;
        }
        image = input.files[0];
        let name = image.name;
        let ext = name.split('.')[name.split('.').length - 1];
        if(!valid.includes(ext)){
          this.customDialog = {
            show: true,
            persistent: false,
            text: 'Please upload a valid extension type',
            icon: 'error',
            buttons: [
              {
                text: 'Close',
                color: 'red',
                click: ()=>{
                  this.customDialog.show = false;
                }
              },
            ]
          };
          return;
        }
        if(image.size/(1024*1024) > 2){
          this.customDialog = {
            show: true,
            persistent: false,
            text: 'The image size is larger than 2mb. You might want to consider compressing it before upload.',
            icon: 'error',
            buttons: [
              {
                text: 'Close',
                color: 'red',
                click: ()=>{
                  this.customDialog.show = false;
                }
              },
            ]
          };
          return;
        }
        // let reader = new FileReader();
        // reader.onload = ()=>{
        //   this.user.image = reader.result;
        // };
        // reader.readAsDataURL(image);
        let newImage;
        let newName = Date.now()+''+Math.round(Math.random()*1E9)+'.'+ext;
        let newOption = {
          type: image.type
        }
        try {
          newImage = new File([image], newName, newOption);
        } catch (e) {
          newImage = image;
        }
        let formData = new FormData();
        formData.append('upload','yes');
        formData.append('avatar',newImage);
        this.uploadAvatar(formData);
      };
      input.click();
    },
    updateAvatar(path){
      let override = '';
      if(typeof this.$route.params.ref !== 'undefined' && this.$route.params.ref != null && this.$route.params.ref.toString().trim() !== ''){
        override = '?override='+this.$route.params.ref;
      }
      this.imageLoading = true;
      fetch(this.$store.state.baseUrl+'user/avatar'+override,{
        method: 'PUT',
        headers: {
          'Authorization': this.$store.state.jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          avatar: path
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.imageLoading = false;
        if(data.status === 201){
          this.user.imageUrl = this.$store.state.baseUrl+'uploads/'+data.path;
          if(this.user.id===this.$store.state.user.id){
            if(this.$store.state.user.id===this.user.id){
              this.$store.commit('updateAvatar',this.user.imageUrl);
            }
          }
          return;
        }
        if(data.status === 401){
          return this.$router.push('/login?goto='+this.formatPath());
        }
        if(data.status === 403){
          return this.notFound = true;
        }
        this.customDialog = {
          show: true,
          persistent: false,
          text: data.message,
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
                this.updateAvatar(path);
              }
            },
          ]
        };
      }).catch(err=>{
        this.imageLoading = false;
        this.customDialog = {
          show: true,
          persistent: false,
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
                this.updateAvatar(path);
              }
            },
          ]
        };
      });
    },
    uploadAvatar(formData){
      this.imageLoading = true;
      fetch(this.$store.state.baseUrl+'upload.php',{
        method: 'POST',
        mode: 'cors',
        body: formData
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.imageLoading = false;
        if(data.status === 200){
          this.updateAvatar(data.files[0]);
          return;
        }
        if(data.status === 401){
          return this.$router.push('/login?goto='+this.formatPath());
        }
        if(data.status === 403){
          return this.notFound = true;
        }
        this.customDialog = {
          show: true,
          persistent: false,
          text: data.message,
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
                this.uploadAvatar(formData);
              }
            },
          ]
        };
      }).catch(err=>{
        this.imageLoading = false;
        this.customDialog = {
          show: true,
          persistent: false,
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
                this.uploadAvatar(formData);
              }
            },
          ]
        };
      });
    },
  }
}
</script>

<style scoped>

</style>