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
                        <h4 class="text-h4 text-xs-h5 text-md-h3" style="font-weight: 700;">Create an account</h4>
                      </slide-y-up-transition>
                      <slide-y-up-transition appear :delay="350">
                        <h6 class="text-subtitle-2 text-md-h6 mt-2 mt-md-4" style="font-weight: 600;">
                          You are required to fill in the correct details below</h6>
                      </slide-y-up-transition>
                    </v-col>
                    <v-col cols="12">
                      <v-form
                          ref="form"
                          v-model="valid"
                          lazy-validation
                          class="signup-form">
                        <slide-y-up-transition appear :delay="400">
                          <v-text-field
                              :light="!$vuetify.theme.dark"
                              label="First Name"
                              prepend-inner-icon="mdi-account"
                              type="text"
                              v-model="data.firstName"
                              :rules="rules.firstName"
                              outlined></v-text-field>
                        </slide-y-up-transition>
                        <slide-y-up-transition appear :delay="450">
                          <v-text-field
                              :light="!$vuetify.theme.dark"
                              label="Last Name"
                              prepend-inner-icon="mdi-account"
                              type="text"
                              v-model="data.lastName"
                              :rules="rules.lastName"
                              outlined></v-text-field>
                        </slide-y-up-transition>
                        <slide-y-up-transition appear :delay="500">
                          <v-text-field
                              :light="!$vuetify.theme.dark"
                              label="Email Address"
                              prepend-inner-icon="mdi-email"
                              type="email"
                              persistent-hint
                              hint="Transactional mails will be sent to this email address"
                              v-model="data.email"
                              :rules="rules.email"
                              outlined></v-text-field>
                        </slide-y-up-transition>
                        <slide-y-up-transition appear :delay="550">
                          <v-text-field
                              :light="!$vuetify.theme.dark"
                              label="Phone Number"
                              prepend-inner-icon="mdi-phone"
                              type="tel"
                              v-model="data.phone"
                              :rules="rules.phone"
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
                              v-model="data.password"
                              :rules="rules.password"
                              outlined></v-text-field>
                        </slide-y-up-transition>
                        <slide-y-up-transition appear :delay="700">
                          <v-text-field
                              :light="!$vuetify.theme.dark"
                              label="Registration Number"
                              prepend-inner-icon="mdi-account"
                              type="text"
                              outlined></v-text-field>
                        </slide-y-up-transition>
                        <slide-y-up-transition appear :delay="700">
                          <div class="text-center mt-4">
                            <v-btn class="px-15"
                                   large
                                   color="primary"
                                   :disabled="!validateBtn"
                                   :loading="loading"
                                   @click="signUp()"
                            >Sign Up</v-btn>
                          </div>
                        </slide-y-up-transition>
                        <slide-y-up-transition appear :delay="750">
                          <div class="text-center mt-4">
                            <v-btn small right text plain :color="$vuetify.theme.dark?'':'black'"
                                   style="font-weight: 700; text-decoration: none;"
                                   to="/login"
                            >
                              Already have an account?
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
      <Dialog :dialog="customDialog" @updated="val=>this.customDialog"/>
    </v-app>
  </div>
  <div v-else>
    <ConfirmCodeScreen :email="data.email" type="signup"/>
  </div>
</template>

<script>
import { SlideYUpTransition, SlideYDownTransition } from 'vue2-transitions';
import Dialog from "@/components/Dialog";
import ConfirmCode from "@/views/Auth/ConfirmCode.vue";
export default {
  name: "SignUpScreen",
  components: {
    ConfirmCode,
    Dialog,
    SlideYDownTransition,
    SlideYUpTransition
  },
  created() {
    this.$store.commit('setAuth',{
      token: '',
      user: {},
      permissions: []
    });
  },
  mounted() {

  },
  data(){
    return {
      customDialog: undefined,
      valid: true,
      showPass: false,
      data:{
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        acceptTerms: ''
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
        password: [
          v => !!v || 'Password is required',
        ],
      },
      loading: false,
      showConfirmCode: false
    }
  },
  computed:{
    validateBtn(){
      return !(
          this.data.firstName.trim() === '' ||
          this.data.lastName.trim() === '' ||
          this.data.email.trim() === '' ||
          this.data.password.trim() === '');

    }
  },
  methods:{
    signUp(){
      if(!this.$refs.form.validate()){
        return;
      }
      this.loading = true;
      setTimeout(()=>{
        this.customDialog = {
          show: true,
          persistent: true,
          text: 'Registration number is not valid',
          icon: 'error',
          closeBtn: {
            text: 'Close',
            color: 'red',
            click: ()=>{
              this.customDialog.show = false;
            }
          }
        };
      },2000);
      return;
      fetch(this.$store.state.baseUrl+'auth',{
        method: 'PUT',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
          ...this.data
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.loading = false;
        if(data.status === 427){

          this.showConfirmCode = true;
          return;
        }
        this.customDialog = {
          show: true,
          persistent: true,
          text: data.message,
          icon: data.status===201?'success':'error',
          closeBtn: {
            text: data.status===201?'Proceed to login':'Close',
            color: data.status===201?'primary':'red',
            click: ()=>{
              this.customDialog.show = false;
              if(data.status === 201){
                if(typeof this.$route.query.goto !== 'undefined' && this.$route.query.goto !== ''){
                  return this.$router.push(this.$route.query.goto);
                }
                this.$router.push('/login');
              }
            }
          }
        };
      }).catch(err=>{
        this.loading = false;
        this.customDialog = {
          show: true,
          persistent: true,
          text: err.message,
          icon: 'error',
          closeBtn: {
            text: 'Close',
            color: 'red',
            click: ()=>{
              this.customDialog.show = false;
            }
          }
        };
      });
    },
  }
}
</script>

<style scoped>

</style>