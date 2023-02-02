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
                      <h4 class="text-h5 text-xs-h6 text-md-h4" style="font-weight: 700;">Create new password</h4>
                    </slide-y-up-transition>
                    <slide-y-up-transition appear :delay="400">
                      <h6 class="text-subtitle-2 mt-2 mt-md-4" style="font-weight: 600;">We recommend you use a strong password, as well as a password that you can remember</h6>
                    </slide-y-up-transition>
                  </v-col>
                  <v-col cols="12">
                    <v-form class="confirm-code-form">
                      <slide-y-up-transition appear :delay="600">
                        <v-text-field
                            :light="!$vuetify.theme.dark"
                            label="New Password"
                            prepend-inner-icon="mdi-lock"
                            :append-icon="showNewPass?'mdi-eye-off':'mdi-eye'"
                            @click:append="showNewPass=!showNewPass"
                            :type="showNewPass?'text':'password'"
                            outlined></v-text-field>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="600">
                        <v-text-field
                            :light="!$vuetify.theme.dark"
                            label="Confirm New Password"
                            prepend-inner-icon="mdi-lock"
                            :append-icon="showConfPass?'mdi-eye-off':'mdi-eye'"
                            @click:append="showConfPass=!showConfPass"
                            :type="showConfPass?'text':'password'"
                            outlined></v-text-field>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="600">
                        <div class="text-center mt-4">
                          <v-btn class="px-15"
                                 large
                                 color="primary"
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
  </v-app>
</template>

<script>
import { SlideYUpTransition, SlideYDownTransition } from 'vue2-transitions';
export default {
  name: "ConfirmNewPassword",
  components: {
    SlideYDownTransition,
    SlideYUpTransition
  },
  mounted() {

  },
  data(){
    return {
      showNewPass: false,
      showConfPass: false
    }
  }
}
</script>

<style scoped>

</style>