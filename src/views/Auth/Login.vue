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
  name: "Login",
  components: {
    Dialog,
    SlideYDownTransition,
    SlideYUpTransition
  },
  metaInfo(){
    return {
      title: 'Login'
    }
  },
  created() {
    this.$store.commit('setAuth',{
      token: '',
      user: {}
    });
    this.$cookies.set('kbt','');
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
      fetch(this.$store.state.baseUrl+'auth',{
        method: 'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.loading = false;
        if(data.status === 200){
          this.$cookies.set('kbt',data.token);
          if(data.user.role === 'admin'){
            this.$store.commit('setMenu',[
              {
                text: 'Dashboard',
                icon: 'mdi-home',
                'to': '/dashboard',
              },
              {
                text: 'Users',
                icon: 'mdi-account-multiple-outline',
                'to': '/users',
              },
              {
                text: 'Thrift',
                icon: 'mdi-piggy-bank-outline',
                'to': '/thrifts',
              },
              {
                text: 'Transactions',
                icon: 'mdi-script-outline',
                'to': '/transactions',
              },
              {
                text: 'Co-operatives',
                icon: 'mdi-view-dashboard-outline',
                'to': '/cooperatives',
              },
              {
                text: 'Loans',
                icon: 'mdi-cash-fast',
                'to': '/loans',
              }
            ]);
          }else{
            this.$store.commit('setMenu',[
              {
                text: 'Dashboard',
                icon: 'mdi-home',
                'to': '/dashboard',
              },
              {
                text: 'Thrift',
                icon: 'mdi-piggy-bank-outline',
                'to': '/thrifts',
              },
              {
                text: 'Transactions',
                icon: 'mdi-script-outline',
                'to': '/transactions',
              },
              {
                text: 'Co-operatives',
                icon: 'mdi-view-dashboard-outline',
                'to': '/cooperatives',
              },
              {
                text: 'Loans',
                icon: 'mdi-cash-fast',
                'to': '/loans',
              }
            ]);
          }
          if(typeof this.$route.query.goto !== 'undefined' && this.$route.query.goto !== ''){
            return window.location.replace(this.$route.query.goto);
          }
          return window.location.replace('/dashboard');
        }
        this.customDialog = {
          show: true,
          persistent: true,
          text: data.message,
          icon: data.status===200?'success':'error',
          closeBtn: {
            text: data.status===200?'Proceed':'Close',
            color: data.status===201?'primary':'red',
            click: ()=>{
              this.customDialog.show = false;
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
    }
  }
}
</script>

<style scoped>

</style>