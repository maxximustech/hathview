<template>
  <v-app>
    <v-main class="add-mt px-0 px-md-3 grey lighten-4">
      <v-row class="px-0">
        <v-col class="col-12">
          <v-card flat color="transparent" class="">
            <v-card-text class="px-0">
              <v-text-field solo rounded class="rounded-xl mb-5" flat label="Search a thrift by name or id" hide-details clearable append-icon="mdi-magnify" @click:append=""/>

              <div class="d-flex mb-2">
                <h4 class="text-subtitle-2 font-weight-bold align-self-center">Active thrifts</h4>
                <v-spacer/>
              </div>
              <Flicking :options="{align: 'prev'}" class="">
                <div class="px-1 panel" v-for="slide in thriftCards">
                  <v-card flat height="120" width="150" class="pa-0 rounded-xl">
                    <v-card-text style="height: 100%;" class="pa-3 d-flex flex-column">
                      <div>
                        <v-chip dark light x-small :color="formatThriftBadgeColor(slide.status)"><span>{{slide.status.split('').map((s,i)=>i===0?s.toUpperCase():s).join('')}}</span></v-chip>
                      </div>
                      <h4 class="text-subtitle-2 font-weight-medium text--white mb-2 text-truncate">
                        {{slide.title}}
                      </h4>
                      <v-progress-linear striped rounded :value="+slide.progress" :color="formatThriftCardColor(slide.progress)" background-color="grey lighten-1"></v-progress-linear>
                      <v-spacer/>
                      <div class="text-right mt-auto">
                        <v-btn plain elevation="0" small class="ml-2" rounded v-for="(btn,b) in slide.buttons" :key="b" to="/thrifts/353454654654">{{btn.text}}</v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </Flicking>

              <div class="d-flex mb-2 mt-3">
                <h4 class="text-subtitle-2 font-weight-bold align-self-center">All thrifts</h4>
                <v-spacer/>
                <v-btn plain :ripple="false" color="primary" @click="newThriftDialog.show = true">Create New</v-btn>
              </div>
              <v-row>
                <v-col class="pb-0" cols="12" sm="6" v-for="(thrift,i) in thrifts" :key="i">
                  <v-card color="white" class="rounded-xl pa-5" flat>
                    <v-card-text class="ma-0 pa-0">
                      <v-chip color="blue" x-small class="pa-2 white--text">
                        {{thrift.status}}
                      </v-chip>
                    </v-card-text>
                    <v-card-title class="ma-0 pa-0 text-subtitle-1">
                      {{thrift.name}}
                    </v-card-title>
                    <v-card-text class="ma-0 pa-0">
                      <h6 class="text-h5 font-weight-bold">${{thrift.amount.toLocaleString('en-GB')}}</h6>
                      <h6 class="text-subtitle-2">Starts: {{thrift.starts}}</h6>
                    </v-card-text>
                    <v-card-actions class="ma-0 pa-0">
                      <v-spacer/>
                      <v-btn plain small color="green">
                        Join
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-main>

    <v-dialog style="z-index: 1002;"
              v-model="newThriftDialog.show"
              width="500"
              persistent
    >
      <v-card class="pa-5">
        <v-card-title>
          Create New Thrift
          <v-divider class="ml-3"></v-divider>
        </v-card-title>
        <v-card-text class="pb-0">
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field label="Name" v-model="newThriftDialog.name" :rules="rules.name" outlined hide-details/>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Amount" type="number" v-model="newThriftDialog.amount" :rules="rules.amount" outlined hide-details/>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Commission" type="number" v-model="newThriftDialog.commission" :rules="rules.commission" outlined hide-details/>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Days" type="number" v-model="newThriftDialog.days" :rules="rules.days" outlined hide-details/>
              </v-col>
              <v-col cols="12">
                <v-checkbox v-model="newThriftDialog.type" color="primary" hide-details value="daily" label="Allow Daily Collection"></v-checkbox>
                <v-checkbox v-model="newThriftDialog.type" color="primary" hide-details value="weekly" label="Allow Weekly Collection"></v-checkbox>
                <v-checkbox v-model="newThriftDialog.type" color="primary" hide-details value="monthly" label="Allow Monthly Collection"></v-checkbox>
              </v-col>
              <v-col cols="12">
                <v-dialog
                    ref="newThriftStartsDialog"
                    v-model="newThriftStartsModal"
                    :return-value.sync="newThriftDialog.starts"
                    persistent
                    width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        v-model="newThriftDialog.starts"
                        label="Start date"
                        append-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on" outlined
                        hide-details
                        :rules="rules.starts"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="newThriftDialog.starts"
                      scrollable
                      :min="new Date().toISOString().slice(0,10)"
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        color="red"
                        @click="newThriftStartsModal = false"
                    >
                      Close
                    </v-btn>
                    <v-btn
                        text
                        color="orange"
                        @click="newThriftDialog.starts = null"
                    >
                      Clear
                    </v-btn>
                    <v-btn
                        text
                        color="primary"
                        @click="$refs.newThriftStartsDialog.save(newThriftDialog.starts)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-dialog>
              </v-col>
              <v-col cols="12">
                <v-select hide-details hide-selected label="Select Collectors" v-model="newThriftDialog.collectorIds" :collectors="collectors" item-text="name" item-value="id" :rules="rules.collectors"/>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="mt-3">
          <v-spacer></v-spacer>
          <v-btn
              color="red"
              text
              @click="newThriftDialog.show = false"
              :disabled="newThriftLoading"
          >
            Close
          </v-btn>
          <v-btn plain color="green" class="mr-3"
                 :disabled="validateNewThrift"
                 :loading="newThriftLoading"
                 @click="createThrift">Create</v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
export default {
  name: "Thrift",
  data: ()=>({
    thriftCards: [
      {
        title: 'Annual 2022/23',
        status: 'active',
        progress: 30,
        buttons: [
          {
            text: 'View',
            color: 'white',
            click: ()=>{

            }
          }
        ]
      },
      {
        title: 'Special request',
        status: 'pending',
        progress: 0,
        buttons: [
          {
            text: 'View',
            color: 'white',
            click: ()=>{

            }
          }
        ]
      },
      {
        title: 'Founder\'s club',
        status: 'inactive',
        progress: 95,
        buttons: [
          {
            text: 'View',
            color: 'white',
            click: ()=>{

            }
          }
        ]
      },
      {
        title: 'Golf challenge',
        status: 'completed',
        progress: 100,
        buttons: [
          {
            text: 'View',
            color: 'white',
            click: ()=>{

            }
          }
        ]
      }
    ],
    thrifts: [
      {
        name: 'Annual 2022/23',
        ref: '65789938784',
        status: 'Ongoing',
        amount: 60000,
        starts: '14/02/2023 12:00'
      },
      {
        name: 'Founder\'s club',
        ref: '89382920939',
        participants: '16',
        status: 'Completed',
        amount: 570000,
        starts: '01/05/2023 00:00'
      },
    ],
    newThriftDialog: {
      show: false,
      name: '',
      amount: '',
      type: [],
      collectorIds: [],
      days: '',
      starts: null,
      commission: ''
    },
    collectors: [],
    rules:{
      name: [
        v => !!v || 'Name is required',
      ],
      amount: [
        v => !!v || 'Amount is required',
        v => +v > 0 || 'Please set a valid amount',
      ],
      commission: [
        v => !!v || 'Commission is required',
      ],
      days: [
        v => !!v || 'Days is required',
        v => +v > 0 || 'Please set valid days',
      ],
      starts: [
        v => !!v || 'Start date is required',
      ],
      collectors: [
        v => v.length > 0 || 'Select at least one collector',
      ],
    },
    newThriftStartsModal: false,
    newThriftLoading: false,

  }),
  computed:{
    validateNewThrift(){

    },
  },
  methods:{
    createThrift(){

    },
    formatThriftBadgeColor(status){
      let p = status;
      if(p === 'completed'){
        return 'green';
      }
      if(p === 'active'){
        return 'green';
      }
      if(p === 'inactive'){
        return 'red';
      }
      return 'orange';
    },
    formatThriftCardColor(progress){
      let p = +progress;
      if(p <= 35){
        return 'red';
      }
      if(p <= 70){
        return 'orange';
      }
      if(p < 100){
        return 'amber';
      }
      return 'green';
    }
  }
}
</script>

<style scoped>

</style>