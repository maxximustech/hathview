<template>
  <v-app>
    <v-main class="add-mt px-0 px-md-3 grey lighten-4">
      <v-row class="px-0 px-md-4">
        <v-col class="col-12">
          <v-card flat color="transparent" class="">
            <v-card-text class="px-0">
              <v-breadcrumbs class="px-0" :items="items" divider="/"/>
              <v-card class="pa-5 rounded-xl" color="white" flat>
                <div class="d-flex mb-2">
                  <v-chip class="align-self-center" dark light x-small :color="formatCooperativeBadgeColor('active')"><span>Active</span></v-chip>
                  <v-spacer/>
                  <v-chip class="rounded-xl align-self-center" flat color="grey lighten-4">
                    <h6 class="text-subtitle-2 font-weight-bold">$50,000</h6>
                  </v-chip>
                </div>
                <h4 class="text-h5 font-weight-medium text--white mb-2 text-truncate">
                  Annual 2022/23 Cooperative
                </h4>
                <v-progress-linear height="10" striped class="rounded-xl" :value="75" :color="formatCooperativeCardColor(75)" background-color="grey lighten-1"></v-progress-linear>

                <div class="d-flex ma-4 justify-end">
                  <div class="d-inline text-center mr-3">
                    <h6 class="text-caption">Starts</h6>
                    <h6 class="text-subtitle-2 font-weight-bold">12/09/2023</h6>
                  </div>
                  <v-divider class="mr-3" vertical/>
                  <div class="d-inline text-center mr-3">
                    <h6 class="text-caption">Paid</h6>
                    <h6 class="text-subtitle-2 font-weight-bold">$5,000 in 28 days</h6>
                  </div>
                </div>
                <div class="mt-8">
                  <div class="d-flex mb-2">
                    <v-btn icon :disabled="new Date(calendar) <= new Date('2022-10-10')" @click="$refs.calendar.prev()">
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                    <v-spacer/>
                    <h6 v-if="$refs.calendar" class="text-subtitle-2 font-weight-bold d-inline">{{$refs.calendar.title}}</h6>
                    <v-spacer/>
                    <v-btn icon :disabled="new Date(calendar) >= new Date('2023-02-10')" @click="()=>{this.$refs.calendar.next()}">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </div>
                  <v-calendar v-model="calendar" ref="calendar" type="month" show-week start="2022-10-10" end="2023-02-10">
                    <template v-slot:day-label="{year,month,date,day}">
                      <div :class="{orange: new Date(year,month,day) >= new Date('2022-10-10')&&new Date(year,month,day) <= new Date('2023-02-10')}" class="rounded-xl pa-1 white--text">{{day===1?new Date(year,month,day).toLocaleString('default',{month: 'short'}):day}}</div>
                    </template>
                  </v-calendar>
                </div>
              </v-card>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "SingleCooperative",
  data: ()=>({
    items: [
      {
        text: 'Cooperatives',
        disabled: false,
        href: '/cooperatives'
      },
      {
        text: 'Current Cooperative',
        disabled: true,
      }
    ],
    calendar: '',
  }),
  methods:{
    formatCooperativeBadgeColor(status){
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
    formatCooperativeCardColor(progress){
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