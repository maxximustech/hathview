<template>
  <v-app>
    <v-main class="add-mt px-0 px-md-3 grey lighten-4">
      <v-row class="px-0">
        <v-col cols="12">
          <v-card flat color="transparent">
            <v-card-title class="text-h5 text-md-h4 text-truncate font-weight-bold">Hello Tunde Adeladan,</v-card-title>
          </v-card>
          <Flicking :options="{align: 'prev'}" class="" @changed="(e)=>{this.onChanged(e)}" @ready="(e)=>{this.panelCount = e.currentTarget.panelCount}">
            <div class="px-1 panel" v-for="slide in sliderCards">
              <v-card flat width="280" :color="slide.color" class="pa-3 rounded-xl">
                <v-card-text class="pa-2">
                  <div class="d-flex">
                    <div class="d-inline">
                      <v-avatar size="60" color="grey lighten-4">
                        <v-icon size="40" :color="slide.color">{{slide.icon}}</v-icon>
                      </v-avatar>
                    </div>
                    <v-spacer/>
                    <div class="d-inline text-right">
                      <h4 class="text-subtitle-2 font-weight-medium text--white text-truncate">
                        {{slide.title}}
                      </h4>
                      <div class="text-h6 font-weight-bold text-truncate">
                        {{slide.text}}
                      </div>
                      <div class="text-right">
                        <v-btn elevation="0" small class="ml-2" rounded v-for="(btn,b) in slide.buttons" :color="btn.color||'grey lighten-4'" :key="b" @click="btn.click">{{btn.text}}</v-btn>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </Flicking>
          <div class="text-center" style="z-index: 5;">
            <span v-for="l in panelCount" class="mr-2 d-inline" style="height: 0; border-bottom: solid 3px;" :style="{paddingRight: l===flickIndex+1?'40px':'20px',borderBottomColor: l===flickIndex+1?'#f8831c':'grey',}" :key="l"></span>
          </div>
          <v-card flat color="transparent">
            <v-card-text class="px-0">
              <div class="d-flex mb-2">
                <h4 class="text-subtitle-2 font-weight-bold align-self-center">Active thrifts</h4>
                <v-spacer/>
                <v-btn plain :ripple="false" color="primary" to="/thrifts">View all</v-btn>
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
                <div class="px-1 panel">
                  <v-card flat height="120" width="150" color="primary lighten-2" class="pa-0 rounded-xl">
                    <v-card-text style="height: 100%;" class="pa-3 d-flex flex-column text-center" v-ripple @click="$router.push('/thrifts')">
                      <div class="text-center">
                        <v-avatar size="60" color="white">
                          <v-icon size="40" color="primary lighten-2">mdi-plus</v-icon>
                        </v-avatar>
                      </div>
                      <div class="text-subtitle-2 mt-auto">Add New</div>
                    </v-card-text>
                  </v-card>
                </div>
              </Flicking>
              <div class="d-flex mt-4 mb-2">
                <h4 class="text-subtitle-2 font-weight-bold align-self-center">Recent transactions</h4>
                <v-spacer/>
                <v-btn plain :ripple="false" color="primary">View all</v-btn>
              </div>
              <v-list subheader two-line color="transparent">
                <v-list-item v-ripple class="rounded-xl mb-2 px-6 py-2" style="background-color: white;" v-for="(item, i) in transactions" :key="i">
                  <v-list-item-content>
                    <v-list-item-title class="">{{item.title}}</v-list-item-title>
                    <v-list-item-subtitle>{{item.date}}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <span class="text-subtitle-2" :style="{'color': item.type==='debit'?'red':'green'}">{{(item.type==='debit'?'-':'+')+item.amount.toLocaleString('en-GB')}}</span>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
import {Pagination} from "@egjs/flicking-plugins";
export default {
  name: "Home",
  data: ()=>({
    flickIndex: 0,
    panelCount: 0,
    sliderCards: [
      {
        title: 'Wallet balance',
        text: '$675,560,698',
        icon: 'mdi-wallet',
        color: 'primary lighten-2',
        buttons: [
          {
            text: 'Add fund',
            click: ()=>{

            }
          }
        ]
      },
      {
        title: 'Outstanding loan',
        text: '$60,297',
        icon: 'mdi-credit-card-clock',
        color: 'green lighten-4',
        buttons: [
          {
            text: 'Pay Now',
            click: ()=>{

            }
          }
        ]
      }
    ],
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
    transactions: [
      {
        title: 'You funded your wallet',
        date: '2023-01-12 13:00',
        amount: 5000,
        type: 'credit'
      },
      {
        title: 'Wallet debited for outstanding loan',
        date: '2023-01-06 18:29',
        amount: 30000,
        type: 'debit'
      },
      {
        title: 'You funded your wallet',
        date: '2023-01-12 13:00',
        amount: 5000,
        type: 'credit'
      },
      {
        title: 'Wallet debited for outstanding loan',
        date: '2023-01-06 18:29',
        amount: 30000,
        type: 'debit'
      },
      {
        title: 'You funded your wallet',
        date: '2023-01-12 13:00',
        amount: 5000,
        type: 'credit'
      },
      {
        title: 'Wallet debited for outstanding loan',
        date: '2023-01-06 18:29',
        amount: 30000,
        type: 'debit'
      },
      {
        title: 'You funded your wallet',
        date: '2023-01-12 13:00',
        amount: 5000,
        type: 'credit'
      },
      {
        title: 'Wallet debited for outstanding loan',
        date: '2023-01-06 18:29',
        amount: 30000,
        type: 'debit'
      },
      {
        title: 'You funded your wallet',
        date: '2023-01-12 13:00',
        amount: 5000,
        type: 'credit'
      },
      {
        title: 'Wallet debited for outstanding loan',
        date: '2023-01-06 18:29',
        amount: 30000,
        type: 'debit'
      },
      {
        title: 'You funded your wallet',
        date: '2023-01-12 13:00',
        amount: 5000,
        type: 'credit'
      },
      {
        title: 'Wallet debited for outstanding loan',
        date: '2023-01-06 18:29',
        amount: 30000,
        type: 'debit'
      },
      {
        title: 'You funded your wallet',
        date: '2023-01-12 13:00',
        amount: 5000,
        type: 'credit'
      },
      {
        title: 'Wallet debited for outstanding loan',
        date: '2023-01-06 18:29',
        amount: 30000,
        type: 'debit'
      },
      {
        title: 'You funded your wallet',
        date: '2023-01-12 13:00',
        amount: 5000,
        type: 'credit'
      },
      {
        title: 'Wallet debited for outstanding loan',
        date: '2023-01-06 18:29',
        amount: 30000,
        type: 'debit'
      },
      {
        title: 'You funded your wallet',
        date: '2023-01-12 13:00',
        amount: 5000,
        type: 'credit'
      },
      {
        title: 'Wallet debited for outstanding loan',
        date: '2023-01-06 18:29',
        amount: 30000,
        type: 'debit'
      },
      {
        title: 'You funded your wallet',
        date: '2023-01-12 13:00',
        amount: 5000,
        type: 'credit'
      },
      {
        title: 'Wallet debited for outstanding loan',
        date: '2023-01-06 18:29',
        amount: 30000,
        type: 'debit'
      },
    ]
  }),
  computed:{

  },
  methods: {
    onChanged(event){
      this.panelCount = event.currentTarget.panelCount;
      this.flickIndex = event.index;
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