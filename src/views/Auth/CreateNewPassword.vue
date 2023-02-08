<template>
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
                      <h4 class="text-h4 text-xs-h5 text-md-h3" style="font-weight: 700;">Create new password</h4>
                    </slide-y-up-transition>
                    <slide-y-up-transition appear :delay="400">
                      <h6 class="text-subtitle-2 text-md-h6 mt-2 mt-md-4" style="font-weight: 600;">We recommend you use a strong password, as well as a password that you can remember</h6>
                    </slide-y-up-transition>
                  </v-col>
                  <v-col cols="12">
                    <v-form ref="passwordForm" class="confirm-code-form">
                      <slide-y-up-transition appear :delay="600">
                        <v-text-field
                            v-model="password.newPassword"
                            :light="!$vuetify.theme.dark"
                            label="New Password"
                            :rules="[v => !!v || 'Password is required']"
                            prepend-inner-icon="mdi-lock"
                            :append-icon="showNewPass?'mdi-eye-off':'mdi-eye'"
                            @click:append="showNewPass=!showNewPass"
                            :type="showNewPass?'text':'password'"
                            outlined></v-text-field>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="600">
                        <v-text-field
                            v-model="password.confNewPassword"
                            :rules="[v => !!v || 'Password is required', doesNewPassMatch()]"
                            :light="!$vuetify.theme.dark"
                            label="Confirm New Password"
                            prepend-inner-icon="mdi-lock"
                            :append-icon="showConfPass?'mdi-eye-off':'mdi-eye'"
                            @click:append="showConfPass=!showConfPass"
                            :type="showConfPass?'text':'password'"
                            outlined></v-text-field>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="700">
                        <v-radio-group label="Log me out of all devices?" v-model="password.deleteSessions">
                          <v-radio label="Yes" :value="true"/>
                          <v-radio label="No" :value="false"/>
                        </v-radio-group>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="800">
                        <div class="text-center mt-4">
                          <v-btn class="px-15"
                                 large
                                 color="primary"
                                 :loading="changePasswordLoading"
                                 @click="changePassword"
                          >Update</v-btn>
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
    <Dialog :dialog="customDialog"/>
  </v-app>
</template>

<script>
import { SlideYUpTransition, SlideYDownTransition } from 'vue2-transitions';
import Dialog from "@/components/Dialog";
export default {
  name: "CreateNewPassword",
  components: {
    Dialog,
    SlideYDownTransition,
    SlideYUpTransition
  },
  mounted() {

  },
  props: {
    otp: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  data(){
    return {
      customDialog: undefined,
      showNewPass: false,
      showConfPass: false,
      password: {
        newPassword: '',
        confNewPassword: '',
        deleteSessions: false
      },
      changePasswordLoading: false
    }
  },
  methods:{
    doesNewPassMatch(){
      return this.password.confNewPassword === this.password.newPassword || 'New password does not match';
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
          confNewPassword: this.password.confNewPassword,
          email: this.email,
          code: this.otp,
          deleteSessions: this.password.deleteSessions
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.changePasswordLoading = false;
        if(data.status === 200){

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
                this.$router.push('/login');
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
  }
}
</script>

<style scoped>

</style>