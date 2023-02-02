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
                      <h4 class="text-h4 text-xs-h5 text-md-h3" style="font-weight: 700;">Login</h4>
                    </slide-y-up-transition>
                    <slide-y-up-transition appear :delay="400">
                      <h6 class="text-subtitle-2 mt-2 mt-md-4" style="font-weight: 600;">Enter your email and password to continue</h6>
                    </slide-y-up-transition>
                  </v-col>
                  <v-col cols="12">
                    <v-form
                        ref="form"
                        v-model="valid"
                        lazy-validation class="login-form">
                      <slide-y-up-transition appear :delay="500">
                        <v-text-field
                            :light="!$vuetify.theme.dark"
                            label="Email Address"
                            prepend-inner-icon="mdi-email"
                            type="email"
                            v-model="email"
                            :rules="emailRule"
                            outlined></v-text-field>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="600">
                        <v-text-field
                            :light="!$vuetify.theme.dark"
                            label="Password"
                            prepend-inner-icon="mdi-lock"
                            :append-icon="showPass?'mdi-eye-off':'mdi-eye'"
                            class="login-pass"
                            @click:append="showPass=!showPass"
                            :type="showPass?'text':'password'"
                            v-model="password"
                            outlined></v-text-field>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="700">
                        <div class="text-end">
                          <v-btn small right text plain :color="$vuetify.theme.dark?'':'black'"
                                 class="mt-n3"
                                 to="/forgot-password"
                                 style="font-weight: 700; text-decoration: none;">
                            Forgot Password?
                          </v-btn>
                        </div>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="800">
                        <div class="text-center mt-4">
                          <v-btn class="px-15"
                                 large
                                 color="primary"
                                 :disabled="email.trim() === '' || password.trim() === ''"
                                 :loading="loading"
                                 @click="logIn"
                          >Log in</v-btn>
                        </div>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="900">
                        <div class="text-center mt-4">
                          <v-btn small right text plain :color="$vuetify.theme.dark?'':'black'"
                                 style="font-weight: 700; text-decoration: none;"
                                 to="/signup"
                          >
                            Join the saving team now
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
  name: "Login",
  components: {
    SlideYDownTransition,
    SlideYUpTransition
  },
  created() {

  },
  data(){
    return {
      customDialog: undefined,
      showPass: false,
      email: '',
      emailRule: [
        v => !!v || 'E-mail is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
      password: '',
      valid: true,
      loading: false
    }
  },
  methods:{
    logIn(){
      if(!this.$refs.form.validate()){
        return;
      }
      this.loading = true;
      this.$router.push('/dashboard');
    }
  }
}
</script>

<style scoped>

</style>