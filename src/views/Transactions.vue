<template>
  <v-app>
    <v-main class="add-mt px-0 px-md-3 grey lighten-4">
      <v-row class="px-0">
        <v-col class="col-12">
          <v-card flat color="transparent">
            <v-card-text class="px-0">
              <v-text-field solo rounded class="rounded-xl mb-5" flat label="Search a transaction by reference or details" hide-details clearable append-icon="mdi-magnify" @click:append=""/>

              <h6 class="text-h6 font-weight-medium mb-2">All Transactions</h6>
              <v-virtual-scroll :bench="transactions.length>100?100:transactions.length" :items="transactions" :item-height="85" height="500">
                <template v-slot:default="{item}">
                  <v-list-item v-ripple class="rounded-xl px-6 py-2" style="background-color: white;">
                    <v-list-item-content>
                      <v-list-item-title class="">{{item.title}}</v-list-item-title>
                      <v-list-item-subtitle>{{item.date}}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <span class="text-subtitle-2" :style="{'color': item.type==='debit'?'red':'green'}">{{(item.type==='debit'?'-':'+')+item.amount.toLocaleString('en-GB')}}</span>
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </v-virtual-scroll>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "Transactions",
  data: ()=>({
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
      },{
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
      },{
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
      },{
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
      },{
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
  })
}
</script>

<style scoped>

</style>