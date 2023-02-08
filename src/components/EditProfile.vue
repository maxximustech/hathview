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

}
</script>

<style scoped>

</style>