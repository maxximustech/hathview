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
                      <h4 class="text-h5 text-xs-h6 text-md-h4" style="font-weight: 700;">Enter the one-time code</h4>
                    </slide-y-up-transition>
                    <slide-y-up-transition appear :delay="400">
                      <h6 class="text-subtitle-2 mt-2 mt-md-4" style="font-weight: 600;">A code was sent to your email address, please enter the code below</h6>
                    </slide-y-up-transition>
                  </v-col>
                  <v-col cols="12">
                    <v-form class="confirm-code-form">
                      <slide-y-up-transition appear :delay="500">
                        <v-otp-input
                            :light="!$vuetify.theme.dark"
                            length="6"
                            type="tel">
                        </v-otp-input>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="600">
                        <div class="text-end">
                          <v-btn small right text plain :color="$vuetify.theme.dark?'':'black'"
                                 class="mt-n3"
                                 style="font-weight: 700; text-decoration: none;">
                            Resend Code
                          </v-btn>
                        </div>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="700">
                        <div class="text-center mt-4">
                          <v-btn class="px-15"
                                 large
                                 color="primary"
                                 to="/reset-password"
                          >Confirm Code</v-btn>
                        </div>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="800">
                        <div class="text-center mt-4">
                          <v-btn small right text plain :color="$vuetify.theme.dark?'':'black'"
                                 style="font-weight: 700; text-decoration: none;"
                                 to="/login"
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
</template>

<script>
import { SlideYUpTransition, SlideYDownTransition } from 'vue2-transitions';
export default {
  name: "ConfirmCode",
  components: {
    SlideYDownTransition,
    SlideYUpTransition
  },
  mounted() {

  },
  data(){
    return {

    }
  }
}
</script>

<style scoped>

</style>