<template>
  <div>
    <v-row no-gutters>
      <v-col v-if="showLoader" cols="12">
        <v-row class="mt-5">
          <v-col cols="12" sm="6" xl="4"
                 v-for="i in 4"
                 :key="i">
            <v-skeleton-loader
                type="article"
            ></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-col>
      <v-col v-else cols="12">
        <v-form ref="form">
          <v-row>
            <v-col cols="12" class="mt-4 mb-3">
              <h4 class="text-h6 font-weight-bold">Edit Profile</h4>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field label="First name" v-model="user.firstName" :rules="rules.firstName" outlined hide-details/>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field label="Last name" v-model="user.lastName" :rules="rules.lastName" outlined hide-details/>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field label="Phone" v-model="user.phone" :rules="rules.phone" outlined hide-details/>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field label="Email address" v-model="email" readonly outlined hide-details>
                <template v-slot:append>
                  <v-btn outlined class="align-self-center mt-n2" color="primary" @click="openEmailDialog">Change</v-btn>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" class="text-center">
              <v-btn color="primary" outlined class="mr-3" :disabled="validateBtn" :loading="loading" @click="updateData">Update</v-btn>
              <v-btn color="orange" outlined @click="openPasswordDialog">Change Password</v-btn>
            </v-col>
          </v-row>
        </v-form>
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
                <v-text-field v-if="!password.otpValid" outlined label="Old Password" :rules="rules.oldPassword" type="password" v-model="password.oldPassword"></v-text-field>
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
              :disabled="password.newPassword.trim() == '' || password.confNewPassword.trim() === ''||(!password.otpValid && password.oldPassword.trim() === '')"
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
  </div>
</template>

<script>
import {SlideXRightTransition,SlideXLeftTransition} from 'vue2-transitions';
export default {
  name: "EditProfile",
  components: {SlideXLeftTransition},
  created(){
    setTimeout(()=>{
      this.showLoader = false;
    },3000);
  },
  destroyed() {
    // try{
    //   clearInterval(this.s);
    // }catch(e){
    //
    // }
  },
  data: ()=>({
    showLoader: true,
    customDialog: undefined,
    user: {
      firstName: 'Tunde',
      lastName: 'Adeladan',
      phone: '08067876378',
    },
    email: 'tunde@me.com',
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
      let override = '';
      if(typeof this.$route.params.id !== 'undefined' && this.$route.params.id != null && this.$route.params.id.toString().trim() !== ''){
        override = '?override='+this.$route.params.id;
      }
      this.changePasswordLoading = true;
      fetch(this.$store.state.baseUrl+'auth/change-password'+override,{
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
      if(typeof this.$route.params.id !== 'undefined' && this.$route.params.id != null && this.$route.params.id.toString().trim() !== ''){
        override = '?override='+this.$route.params.id;
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
      if(typeof this.$route.params.id !== 'undefined' && this.$route.params.id != null && this.$route.params.id.toString().trim() !== ''){
        override = '?override='+this.$route.params.id;
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
      if(typeof this.$route.params.id !== 'undefined' && this.$route.params.id != null && this.$route.params.id.toString().trim() !== ''){
        override = '?override='+this.$route.params.id;
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
      if(typeof this.$route.params.id !== 'undefined' && this.$route.params.id != null && this.$route.params.id.toString().trim() !== ''){
        override = '?override='+this.$route.params.id;
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
      let override = '';
      if(typeof this.$route.params.id !== 'undefined' && this.$route.params.id != null && this.$route.params.id.toString().trim() !== ''){
        override = '?override='+this.$route.params.id;
      }
      this.loadContent('profile/edit'+override).then(data=>{
        if(data.status === 200){
          this.user = {
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            phone: data.user.phone,
            interests: data.user.Interests
          }
          this.interests = data.interests;
          this.email = data.user.email;
          this.passwordMinLength = data.passwordMinLength;
          this.passwordMaxLength = data.passwordMaxLength;
          this.showLoader = false;
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
      })
    },
    updateData(){
      if(!this.$refs.form.validate()){
        return;
      }
      let override = '';
      if(typeof this.$route.params.id !== 'undefined' && this.$route.params.id != null && this.$route.params.id.toString().trim() !== ''){
        override = '?override='+this.$route.params.id;
      }
      this.loading = true;
      fetch(this.$store.state.baseUrl+'user/personal'+override,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt
        },
        body: JSON.stringify({
          ...this.user,
          interests: this.user.interests.map(i=>{
            return i.id;
          })
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
    }
  }
}
</script>

<style scoped>

</style>