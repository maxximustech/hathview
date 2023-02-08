<template>
  <div v-if="contentLoading">
    <ContentLoading/>
  </div>
  <div v-else-if="!showNewPass">
    <v-app>
      <v-main class="add-mt grey lighten-4">
        <v-container>
          <v-row>
            <v-col class="col-12 col-md-6 offset-md-3">
              <v-row :class="$vuetify.theme.dark?'':'black--text'">

                <v-col cols="12">
                  <v-row class="px-8 py-10 px-md-15 py-md-15">
                    <v-col cols="12">
                      <slide-y-up-transition appear :delay="300">
                        <h4 class="text-h4 text-xs-h5 text-md-h3" style="font-weight: 700;">Enter the one-time code</h4>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="400">
                        <h6 class="text-subtitle-2 text-md-h6 mt-2 mt-md-4" style="font-weight: 600;">A code was sent to your email address, please enter the code below</h6>
                      </slide-y-up-transition>
                    </v-col>
                    <v-col cols="12">
                      <v-form class="confirm-code-form">
                        <slide-y-up-transition appear :delay="500">
                          <v-otp-input
                              :light="!$vuetify.theme.dark"
                              v-model="otp"
                              @finish="confirmCode"
                              length="6"
                              type="tel">
                          </v-otp-input>
                        </slide-y-up-transition>
                        <slide-y-up-transition appear :delay="600">
                          <div class="text-end">
                            <v-btn small right text plain :color="$vuetify.theme.dark?'':'black'"
                                   class="mt-n3"
                                   :disabled="confirmCodeLoading || resendCodeAfter > 0"
                                   :loading="resendCodeLoading"
                                   @click="resendCode(true)"
                                   style="font-weight: 700; text-decoration: none;">
                              Resend {{resendCodeAfter>0?'in '+resendCodeAfter+'s':'code'}}
                            </v-btn>
                          </div>
                        </slide-y-up-transition>
                        <slide-y-up-transition appear :delay="700">
                          <div class="text-center mt-4">
                            <v-btn class="px-15"
                                   large
                                   color="primary"
                                   @click="confirmCode"
                                   :disabled="resendCodeLoading"
                                   :loading="confirmCodeLoading"
                            >Confirm Code</v-btn>
                          </div>
                        </slide-y-up-transition>
                        <slide-y-up-transition appear :delay="800">
                          <div class="text-center mt-4">
                            <v-btn small right text plain :color="$vuetify.theme.dark?'':'black'"
                                   style="font-weight: 700; text-decoration: none;"
                                   :to="'/login'"
                            >
                              Back to login page
                            </v-btn>
                          </div>
                        </slide-y-up-transition>
                      </v-form>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
    <Dialog :dialog="customDialog"/>
  </div>
  <div v-else>
    <CreateNewPasswordScreen :otp="otp" :email="email"/>
  </div>
</template>

<script>
import { SlideYUpTransition, SlideYDownTransition } from 'vue2-transitions';
import CreateNewPasswordScreen from "@/views/Auth/CreateNewPassword";
import Dialog from "@/components/Dialog";
import ContentLoading from "@/components/ContentLoading";
export default {
  name: "ConfirmCode",
  components: {
    ContentLoading,
    Dialog,
    CreateNewPasswordScreen,
    SlideYDownTransition,
    SlideYUpTransition
  },
  created(){

  },
  mounted() {
    let rtEnd = new Date().getTime() + (this.resendCodeAfter * 1000);
    this.u = setInterval(()=>{
      if(this.resendCodeAfter > 0 && Date.now() < rtEnd){
        this.resendCodeAfter = Math.ceil((rtEnd - Date.now())/1000);
      }else{
        this.resendCodeAfter = 0;
        clearInterval(this.u);
      }
    },1000);
  },
  data: ()=>({
    customDialog: undefined,
    otp: '',
    u: null,
    resendCodeAfter: 60,
    confirmCodeLoading: false,
    showNewPass: false,
    resendCodeLoading: false,
    contentLoading: false
  }),
  props: {
    email: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  methods: {
    confirmCode(){
      this.confirmCodeLoading = true;
      fetch(this.$store.state.baseUrl+'auth/otp/'+this.otp+'?type='+this.type+'&email='+this.email,{
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt
        }
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.confirmCodeLoading = false;
        if(data.status === 200){
          if(this.type === 'forgot-password'){
            this.showNewPass = true;
          }
          if(this.type === 'signup'){
            this.activateAccount();
          }
        }
        else{
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
        this.confirmCodeLoading = false;
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
                this.confirmCode();
                this.customDialog.show = false;
              }
            }
          ]
        };
      });
    },
    resendCode(retry=false){
      this.resendCodeLoading = true;
      fetch(this.$store.state.baseUrl+'auth/send-code',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt
        },
        body: JSON.stringify({
          email: this.email,
          type: this.type
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.resendCodeLoading = false;
        if(data.status === 200 || data.status === 201){
          this.resendCodeAfter = 60;
          let rtEnd = new Date().getTime() + (this.resendCodeAfter * 1000);
          this.u = setInterval(()=>{
            if(this.resendCodeAfter > 0 && Date.now() < rtEnd){
              this.resendCodeAfter = Math.ceil((rtEnd - Date.now())/1000);
            }else{
              this.resendCodeAfter = 0;
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
        this.resendCodeLoading = false;
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
                this.resendCode(retry);
                this.customDialog.show = false;
              }
            }
          ]
        };
      });
    },
    activateAccount(){
      this.contentLoading = true;
      fetch(this.$store.state.baseUrl+'auth/activate-account',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt
        },
        body: JSON.stringify({
          email: this.email,
          code: this.otp
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
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
              if(data.status===200||data.status===201){
                this.$router.push('/login');
              }
            }
          }
        };
      }).catch(err=>{
        this.resendCodeLoading = false;
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
                this.activateAccount();
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