<template>
  <v-app>
    <v-main class="add-mt px-0 px-md-3 grey lighten-4">
      <v-row class="px-0">
        <v-col class="col-12">
          <v-card flat color="transparent" class="">
            <v-card-text class="px-0">
              <v-text-field solo rounded class="rounded-xl mb-5" flat label="Search a user by name or email" hide-details clearable append-icon="mdi-magnify" @click:append=""/>

              <div class="d-flex mb-2 mt-3">
                <h6 class="text-h6 font-weight-medium mb-2">All Users</h6>
                <v-spacer/>
                <v-btn plain :ripple="false" color="primary" @click="openNewUserDialog">Create New</v-btn>
              </div>
              <v-virtual-scroll :bench="customers.length>100?100:customers.length" :items="customers" :item-height="85" height="500">
                <template v-slot:default="{item}">
                  <v-list-item v-ripple class="rounded-xl px-6 py-2" style="background-color: white;">
                    <v-list-item-avatar>
                      <v-avatar color="primary" size="40">
                        <v-img v-if="typeof item.imageUrl === 'string' && item.imageUrl !== ''" :src="item.imageUrl"/>
                        <span class="font-weight-medium white--text" v-if="typeof item.imageUrl !== 'string' || item.imageUrl === ''">{{item.title.split('')[0]}}</span>
                      </v-avatar>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title class="">{{item.title}}</v-list-item-title>
                      <v-list-item-subtitle class="">{{item.role}}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-list-item-action-text>
                        <v-btn plain color="primary" @click="viewUserDetails(item.id)">View</v-btn>
                      </v-list-item-action-text>
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </v-virtual-scroll>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-main>

    <v-dialog style="z-index: 1002;"
              v-model="newUserDialog.show"
              width="500"
              persistent
    >
      <v-card class="pa-5">
        <v-card-title>
          Create New Account
          <v-divider class="ml-3"></v-divider>
        </v-card-title>
        <v-card-text class="pb-0">
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field label="First name" v-model="newUserDialog.firstName" :rules="rules.firstName" outlined hide-details/>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Last name" v-model="newUserDialog.lastName" :rules="rules.lastName" outlined hide-details/>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Phone" type="tel" v-model="newUserDialog.phone" :rules="rules.phone" outlined hide-details/>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Email address" type="email" v-model="newUserDialog.email" :rules="rules.email" outlined hide-details/>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Password" v-model="newUserDialog.password" :rules="rules.newPassword" outlined hide-details>
                  <template v-slot:append>
                    <v-btn outlined class="align-self-center mt-n2" color="primary" @click="newUserDialog.password = generateRandomString(10)">Generate</v-btn>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="mt-3">
          <v-spacer></v-spacer>
          <v-btn
              color="red"
              text
              @click="newUserDialog.show = false"
              :disabled="newUserloading"
          >
            Close
          </v-btn>
          <v-btn plain color="green" class="mr-3"
                 :disabled="validateNewUser"
                 :loading="newUserloading"
                 @click="createUser">Create</v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog style="z-index: 1002;"
              value="true"
              width="500"
              v-if="viewUserDialog.show"
    >
      <v-card class="pa-5">
        <v-card-title>
          User Details
          <v-divider class="ml-3"></v-divider>
        </v-card-title>
        <v-card-text class="pb-0">
          <div class="text-center">
            <v-avatar color="primary lighten-1" size="100">
                          <span class="white--text text-h4 font-weight-bold">
                            SA
                          </span>
            </v-avatar>
            <h4 class="text-subtitle-2 font-weight-bold mt-2">{{viewUserDialog.user.title}}</h4>
            <h6 class="text-caption font-weight-medium primary--text mt-n1 mb-1">{{viewUserDialog.user.role}}</h6>
          </div>
          <v-row>
            <v-col cols="12">
              <h6 class="text-subtitle-2">User ID: 847839284784893</h6>
              <h6 class="text-subtitle-2">Wallet balance: $5000</h6>
              <h6 class="text-subtitle-2">Outstanding loan: $300</h6>
              <h6 class="text-subtitle-2">Date registered: 12/09/2010 13:25</h6>
              <h6 class="text-subtitle-2">Last login: 21/01/2021 23:19</h6>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="mt-3">
          <v-spacer></v-spacer>
          <v-btn
              color="red"
              text
              @click="closeViewUser"
          >
            Close
          </v-btn>
          <v-btn plain color="green" class="mr-3"
                 to="/user/78399484849">Go to profile</v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
export default {
  name: "Customers",
  data: ()=>({
    customers: [
      {
        id: 1,
        imageUrl: 'https://cdn.vuetifyjs.com/images/john.jpg',
        title: 'Tunde Adeladan',
        role: 'Admin'
      },
      {
        id: 2,
        imageUrl: '',
        title: 'Maxximus Technologies',
        role: 'Collector'
      },
      {
        id: 3,
        title: 'Oladepo Oreoluwa',
        role: 'Customer'
      },
      {
        id: 4,
        imageUrl: 'https://cdn.vuetifyjs.com/images/john.jpg',
        title: 'Anjola Oyeniran',
        role: 'Customer'
      },
      {
        id: 5,
        imageUrl: '',
        title: 'Akinpelu Deborah',
        role: 'Customer'
      },
    ],
    newUserDialog: {
      show: false,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confPassword: '',
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
      newPassword: [
        v => !!v || 'Password is required',
      ],
    },
    newUserloading: false,
    viewUserDialog: {
      show: false,
      user: null
    }
  }),
  computed:{
    validateNewUser(){

    },
  },
  methods: {
    closeViewUser(){
      this.viewUserDialog = {
        show: false,
        user: null
      }
    },
    viewUserDetails(id){
      let u = this.customers.find(c=>c.id===id);
      if(u == null){
        return;
      }
      this.viewUserDialog = {
        show: true,
        user: u
      }
    },
    openNewUserDialog(){
      this.newUserDialog = {
        show: true,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      }
    },
    createUser(){

    }
  }
}
</script>

<style scoped>

</style>