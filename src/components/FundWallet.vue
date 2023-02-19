<template>
  <v-dialog style="z-index: 1002;"
            v-model="cd.show"
            width="500"
            persistent
  >
    <v-card class="rounded-xl pa-5">
      <v-card-title>
        Fund Wallet
        <v-divider class="ml-3"></v-divider>
      </v-card-title>
      <v-card-text class="pb-0">
        <div v-if="curStep===1">
          <v-form ref="stepOne">
            <v-row>
              <v-col cols="12">
                <v-text-field type="tel" label="Amount" v-model="cd.amount" :rules="[v=>!!v||'Amount is required',v=>+v>0||'Amount must be valid']" outlined/>
              </v-col>
            </v-row>
          </v-form>
        </div>
        <div v-if="curStep===2">
          <h4 class="text-subtitle-2">Please make the payment to any of the account listed below</h4>
          <v-list three-line>
            <v-list-item v-for="(item, i) in accounts" :key="i" class="rounded-xl pa-3" style="background-color: white;">
              <v-list-item-content>
                <v-list-item-subtitle>{{item.bank}}</v-list-item-subtitle>
                <v-list-item-title class="">{{item.name}}</v-list-item-title>
                <v-list-item-subtitle>{{item.number}}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-clipboard:copy="item.number"
                        v-clipboard:success="onCopySuccess"
                        v-clipboard:error="onCopyError"
                        plain small :ripple="false" color="primary">
                      Copy
                      <v-icon>mdi-content-copy</v-icon>
                    </v-btn>
                  </template>
                  <span>Copy Account number</span>
                </v-tooltip>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </div>
        <div v-if="curStep===3">
          <h4 class="text-subtitle-2">Please upload your proof of payment, this will be used to confirm your payment</h4>
          <v-img
              :src="pop"
              height="300"
              style="border: solid 1px gray; border-radius: 10px;"
              class="mt-3 mb-5"
              @click="setUpFileUploader"
          >
            <v-row
                class="fill-height ma-0"
                align="center"
                justify="center"
            >
              <v-btn color="primary" plain :ripple="false" :loading="imageLoading">
                {{ pop != null && pop!== '' ? 'Click to change' : 'Click to upload' }}
              </v-btn>
            </v-row>
          </v-img>
        </div>
      </v-card-text>
      <v-card-actions class="mt-3">
        <v-spacer></v-spacer>
        <v-btn
            color="red"
            text :ripple="false"
            @click="closeDialog"
            :disabled="loading"
        >
          Close
        </v-btn>
        <v-btn v-if="curStep===1" plain color="green" class="mr-3"
               :disabled="+cd.amount<=0" :ripple="false"
               @click="curStep=2">Proceed</v-btn>
        <v-btn v-if="curStep===2" plain color="green" class="mr-3"
               :ripple="false"
               @click="curStep=3">I have made the payment</v-btn>
        <v-btn v-if="curStep===3" plain color="green" class="mr-3"
               :loading="loading" :ripple="false" :disabled="pop==null"
               @click="initTransaction">Confirm payment</v-btn>

      </v-card-actions>
    </v-card>
    <Dialog :dialog="customDialog"/>
  </v-dialog>
</template>

<script>
import Dialog from "@/components/Dialog";
export default {
  name: "FundWallet",
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
    }
  },
  created(){
    if(+this.cd.amount > 0){
      this.curStep = 2;
    }
  },
  data: ()=>({
    customDialog: undefined,
    loading: false,
    curStep: 1,
    accounts: [
      {
        img: '',
        bank: 'Guarantee Trust Bank',
        name: 'Abdullahi Azeez Boluwatife',
        number: '0211408061'
      }
    ],
    pop: null,
    imageLoading: false
  }),
  computed:{
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
    setUpFileUploader(){
      if(this.imageLoading){
        return;
      }
      let image;
      let valid = ['gif','jpeg','jpg','png'];
      let input = document.createElement('input');
      input.type = 'file';
      input.accept = "image/jpeg,image/jpg,image/png,image/gif";
      input.onchange = _ => {
        if(typeof input.files !== 'object' || input.files.length <= 0){
          return;
        }
        image = input.files[0];
        let name = image.name;
        let ext = name.split('.')[name.split('.').length - 1];
        if(!valid.includes(ext)){
          this.customDialog = {
            show: true,
            persistent: false,
            text: 'Please upload a valid extension type',
            icon: 'error',
            buttons: [
              {
                text: 'Close',
                color: 'red',
                click: ()=>{
                  this.customDialog.show = false;
                }
              },
            ]
          };
          return;
        }
        if(image.size/(1024*1024) > 1){
          this.customDialog = {
            show: true,
            persistent: false,
            text: 'The image size is larger than 1mb. You might want to consider compressing it before upload.',
            icon: 'error',
            buttons: [
              {
                text: 'Close',
                color: 'red',
                click: ()=>{
                  this.customDialog.show = false;
                }
              },
            ]
          };
          return;
        }
        let newImage;
        let newName = Date.now()+''+Math.round(Math.random()*1E9)+'.'+ext;
        let newOption = {
          type: image.type
        }
        try {
          newImage = new File([image], newName, newOption);
        } catch (e) {
          newImage = image;
        }
        let formData = new FormData();
        formData.append('file',newImage);
        this.uploadImage(formData);
      };
      input.click();
    },
    uploadImage(formData){
      this.imageLoading = true;
      fetch(this.$store.state.baseUrl+'upload',{
        method: 'PUT',
        headers: {
          'Authorization': this.$store.state.jwt
        },
        body: formData
      }).then(res=>{
        return res.json();
      }).then(data=>{
        this.imageLoading = false;
        if(data.status === 201){
          this.pop = this.$store.state.baseUrl+'uploads/'+data.path
          return;
        }
        this.customDialog = {
          show: true,
          persistent: false,
          text: data.message,
          icon: 'error',
          buttons: [
            {
              text: 'Close',
              color: 'red',
              click: ()=>{
                this.customDialog.show = false;
              }
            }
          ]
        };
      }).catch(err=>{
        this.imageLoading = false;
        this.customDialog = {
          show: true,
          persistent: false,
          text: err.message,
          icon: 'error',
          buttons: [
            {
              text: 'Retry',
              color: 'orange',
              click: ()=>{
                this.customDialog.show = false;
                this.uploadImage(formData);
              }
            },
            {
              text: 'Close',
              color: 'red',
              click: ()=>{
                this.customDialog.show = false;
              }
            },
          ]
        };
      });
    },
    closeDialog(){
      this.cd.amount = '';
      this.cd.show = false;
      this.curStep = 1;
    },
    initTransaction(){
      this.loading = true;
      fetch(this.$store.state.baseUrl+'fund',{
        method: 'PUT',
        headers:{
          'Content-Type':'application/json',
          'Authorization':this.$store.state.jwt
        },
        body: JSON.stringify({
          amount: this.cd.amount,
          pop: this.pop
        })
      }).then(res=>{
        return res.json();
      }).then(data=>{
        if(data.status===201&&typeof data.wallet !== "undefined"){
          this.$store.commit('updateWallet',data.wallet);
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
                this.curStep = 1;
                this.cd.show = false;
                this.pop = null;
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