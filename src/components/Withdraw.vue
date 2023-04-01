<template>
  <v-dialog style="z-index: 1002;"
            v-model="cd.show"
            v-if="cd.show"
            width="500"
            persistent
  >
    <v-card class="rounded-xl pa-5">
      <v-card-title>
        Withdraw from wallet
        <v-divider class="ml-3"></v-divider>
      </v-card-title>
      <v-card-text class="pb-0">
        <div v-if="notValid">
          <h4 class="text-subtitle-2">Please update your bank information in your profile to continue.</h4>
        </div>
        <div v-if="curStep===2">
          <v-form ref="stepTwo">
            <v-row>
              <v-col cols="12">
                <v-text-field type="tel" label="Amount" v-model="cd.amount" :rules="[v=>!!v||'Amount is required',v=>+v>0||'Amount must be valid',v=>+v>=1000||'Minimum withdrawal is '+formatPriceV2(1000)]" @keyup="cd.amount=+cd.amount>user.wallet?user.wallet:cd.amount" outlined/>
              </v-col>
            </v-row>
          </v-form>
        </div>
        <div v-if="curStep === 3">
          <v-form ref="otpForm">
            <h6 class="text-subtitle-2">A code was sent to your email address, please enter the code below</h6>
            <v-otp-input
                v-model="otp"
                length="6"
                @finish="initTransaction"
                type="tel">
            </v-otp-input>
          </v-form>
          <div class="text-end">
            <v-btn small plain
                   :ripple="false"
                   class="mt-n3"
                   :disabled="resendAfter>0"
                   :loading="otpLoading"
                   @click="sendOtp(true)"
                   style="font-weight: 700;">
              Resend {{resendAfter>0?'in '+resendAfter+'s':'code'}}
            </v-btn>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="mt-3">
        <v-spacer></v-spacer>
        <v-btn
            color="red"
            text :ripple="false"
            @click="closeDialog"
            :disabled="loading||otpLoading"
        >
          Close
        </v-btn>
        <v-btn v-if="notValid" plain color="green" class="mr-3"
               :ripple="false" to="/profile">Go to profile</v-btn>
        <v-btn v-if="curStep===2" plain color="green" class="mr-3"
               :loading="otpLoading" :ripple="false" :disabled="+cd.amount<=0"
               @click="sendOtp(false)">Confirm</v-btn>
        <v-btn v-if="curStep===3" plain color="green" class="mr-3"
               :loading="loading" :ripple="false" :disabled="+cd.amount<=0"
               @click="initTransaction">Withdraw</v-btn>

      </v-card-actions>
    </v-card>
    <Dialog :dialog="customDialog"/>
  </v-dialog>
</template>

<script>
import Dialog from "@/components/Dialog";
export default {
  name: "Withdraw",
  components: {Dialog},
  props:{
    dialog:{
      type: Object,
      default(){
        return {
          show: false,
          amount: '',
        };
      }
    },
    user:{
      type: Object,
      required: true
    }
  },
  created(){
    if(this.user.payMethod==='bank'&&(this.user.bank_name==null||this.user.bank_name.trim()===''
        ||this.user.account_name==null||this.user.account_name.trim()===''
        ||this.user.account_no==null||this.user.account_no.trim()==='')
    ){
      this.curStep = 1;
    }else{
      this.curStep = 2;
    }
  },
  data: ()=>({
    customDialog: undefined,
    loading: false,
    curStep: 2,
    otp: '',
    otpLoading: false,
    resendAfter: 60
  }),
  computed:{
    notValid(){
      return this.user.payMethod==='bank'&&(this.user.bank_name==null||this.user.bank_name.trim()===''
          ||this.user.account_name==null||this.user.account_name.trim()===''
          ||this.user.account_no==null||this.user.account_no.trim()==='');
    },
    cd:{
      get(){
        return this.dialog;
      },
      set(val){
        this.$emit('updated',val);
      }
    }
  },
  methods: {
    sendOtp(retry=false){
      if(!this.$refs.stepTwo.validate()){
        return;
      }
      let override = '';
      if(typeof this.$route.params.ref !== 'undefined' && this.$route.params.ref != null && this.$route.params.ref.toString().trim() !== ''){
        override = '?override='+this.$route.params.ref;
      }
      this.otpLoading = true;
      fetch(this.$store.state.baseUrl+'auth/send-code'+override,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt
        },
        body: JSON.stringify({
          email: this.user.email,
          type: 'withdraw'
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.otpLoading = false;
        if(data.status === 200 || data.status === 201){
          this.curStep = 3
          this.resendAfter = 60;
          let rtEnd = new Date().getTime() + (this.resendAfter * 1000);
          this.u = setInterval(()=>{
            if(this.resendAfter > 0 && Date.now() < rtEnd){
              this.resendAfter = Math.ceil((rtEnd - Date.now())/1000);
            }else{
              this.resendAfter = 0;
              clearInterval(this.u);
            }
          },1000);
          if(!retry){
            this.customDialog = {
              show: true,
              persistent: true,
              text: data.message,
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
        }else {
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
        this.otpLoading = false;
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
                this.sendOtp(retry);
                this.customDialog.show = false;
              }
            }
          ]
        };
      });
    },
    closeDialog(){
      this.cd.amount = '';
      this.cd.show = false;
      this.curStep = 1;
      this.otp = '';
    },
    initTransaction(){
      if(this.otp==null||this.otp.trim().length<6){
        this.otp = '';
        this.curStep = 2;
      }
      let override = '';
      if(typeof this.$route.params.ref !== 'undefined' && this.$route.params.ref != null && this.$route.params.ref.toString().trim() !== ''){
        override = '?override='+this.$route.params.ref;
      }
      this.loading = true;
      fetch(this.$store.state.baseUrl+'withdraw'+override,{
        method: 'PUT',
        headers:{
          'Content-Type':'application/json',
          'Authorization':this.$store.state.jwt
        },
        body: JSON.stringify({
          amount: this.cd.amount,
          otp: this.otp
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        if(data.status===201&&typeof data.wallet !== "undefined"){
          if(this.$store.state.user.id===this.user.id){
            this.$store.commit('updateWallet',data.wallet);
          }
        }
        this.loading = false;
        this.customDialog = {
          show: true,
          persistent: true,
          text: data.message,
          icon: data.status===201?'success':'error',
          closeBtn: {
            text: 'Close',
            color: data.status===201?'primary':'red',
            click: ()=>{
              this.customDialog.show = false;
              if(data.status === 201){
                this.cd.amount = '';
                this.curStep = 2;
                this.cd.show = false;
                this.$emit('success');
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
                this.initTransaction();
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