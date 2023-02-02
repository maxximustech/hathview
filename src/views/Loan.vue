<template>
  <v-app>
    <v-main class="add-mt px-0 px-md-3 grey lighten-4">
      <v-row class="px-0">
        <v-col class="col-12">
          <v-card flat color="transparent" class="">
            <v-card-text class="px-0">
              <v-text-field solo rounded class="rounded-xl mb-5" flat label="Search a loan by thrift name or id" hide-details clearable append-icon="mdi-magnify" @click:append=""/>

              <div class="d-flex mb-2">
                <h4 class="text-subtitle-2 font-weight-bold align-self-center">Outstanding loans</h4>
                <v-spacer/>
              </div>
              <Flicking :options="{align: 'prev'}" class="">
                <div class="px-1 panel" v-for="slide in loanCards">
                  <v-card color="red" flat width="200" class="pa-0 rounded-xl white--text">
                    <v-card-text style="height: 100%;" class="pa-3 d-flex flex-column">
                      <span class="text-caption white--text">Borrowed from</span>
                      <h4 class="text-subtitle-2 font-weight-medium white--text text-truncate">
                        {{slide.title}}
                      </h4>
                      <h4 class="text-h6 font-weight-medium white--text mb-2 text-truncate">
                        {{formatPriceV2(slide.amount)}}
                      </h4>
                      <v-spacer/>
                      <div class="text-right mt-auto">
                        <v-btn elevation="0" small class="ml-2" rounded>Pay Now</v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </Flicking>

            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "Loan",
  data: ()=>({
    loanCards: [
      {
        title: 'Annual 2022/23',
        amount: 7000,
      },
      {
        title: 'Special request',
        amount: 25000,
      }
    ],

  }),
  computed:{
    validateNewLoan(){

    },
  },
  methods:{
    createLoan(){

    },
    formatLoanBadgeColor(status){
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
    formatLoanCardColor(progress){
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