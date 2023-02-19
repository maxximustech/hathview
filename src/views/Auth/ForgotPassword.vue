<template>
  <div v-if="!showConfirmCode">
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
                        <h4 class="text-h4 text-xs-h5 text-md-h3" style="font-weight: 700;">Forgot your password?</h4>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="400">
                        <h6 class="text-subtitle-2 text-md-h6 mt-2 mt-md-4" style="font-weight: 600;">Enter your email address below, we will send you a code</h6>
                      </slide-y-up-transition>
                    </v-col>
                    <v-col cols="12">
                      <v-form ref="forgotPasswordForm" class="forgot-password-form">
                        <slide-y-up-transition appear :delay="500">
                          <v-text-field
                              :light="!$vuetify.theme.dark"
                              label="Email Address"
                              prepend-inner-icon="mdi-email"
                              v-model="email"
                              :rules="emailRule"
                              type="email"
                              outlined></v-text-field>
                        </slide-y-up-transition>
                        <slide-y-up-transition appear :delay="600">
                          <div class="text-center mt-4">
                            <v-btn class="px-15"
                                   large
                                   color="primary"
                                   @click="forgotPassword(false)"
                                   :loading="forgotPasswordLoading"
                            >Send Code</v-btn>
                          </div>
                        </slide-y-up-transition>
                        <slide-y-up-transition appear :delay="700">
                          <div class="text-center mt-4">
                            <v-btn small right text plain :color="$vuetify.theme.dark?'':'black'"
                                   style="font-weight: 700; text-decoration: none;"
                                   :to="'/login'"
                            >
                              Remember your password?
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
    <ConfirmCodeScreen :email="email" type="forgot-password"/>
  </div>
</template>

<script>
import { SlideYUpTransition, SlideYDownTransition } from 'vue2-transitions';
import ConfirmCodeScreen from "@/views/Auth/ConfirmCode";
import Dialog from "@/components/Dialog";
export default {
  name: "ForgotPassword",
  components: {
    Dialog,
    ConfirmCodeScreen,
    SlideYDownTransition,
    SlideYUpTransition
  },
  mounted() {

  },
  metaInfo(){
    return {
      title: 'Forgot Password'
    }
  },
  data: ()=>({
    customDialog: undefined,
    email: '',
    forgotPasswordLoading: false,
    showConfirmCode: false,
    emailRule: [
      v => !!v || 'E-mail is required',
      v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    ],
  }),
  created(){
    this.$store.commit('setAuth',{
      token: '',
      user: {}
    });
    this.$cookies.set('kbt','');
  },
  methods: {
    forgotPassword(){
      if(!this.$refs.forgotPasswordForm.validate()){
        return;
      }
      this.forgotPasswordLoading = true;
      fetch(this.$store.state.baseUrl+'auth/send-code',{
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
          this.showConfirmCode = true;
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
                this.forgotPassword();
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