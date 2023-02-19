import _ from 'lodash';
export default {
    data: ()=>({
        //customDialog: undefined
    }),
    computed: {
        isLoggedIn(){
            return typeof this.$store.state.user.firstName !== 'undefined';
        },
    },
    methods:{
        async execSearch(){
            if(this.searchInput != null && this.searchInput.trim().length > 2){
                this.searchLoading = true;
                await new Promise(done => {
                    setTimeout(()=>done(),1000);
                });
                this.searchLoading = false;
                if(this.searchInput.toLowerCase() === 'a a'){
                    this.searchResult = [
                        {
                            id: 1,
                            img: '/img/test/photo1.jpeg',
                            name: 'Vue Js - The Complete Guide',
                            rating: 4.5,
                            price: 600000,
                            discountPrice: 55000,
                            creator: 'Maxximus Technologies',slug: 'course-slug'
                        },
                        {
                            id: 2,
                            img: '/img/test/photo5.jpeg',
                            name: 'React Js, Native',
                            rating: 5.0,
                            price: 2500,
                            discountPrice: 1500,
                            creator: 'Domicile Designs',slug: 'course-slug'
                        },
                        {
                            id: 3,
                            img: '/img/test/photo3.jpeg',
                            name: 'After Effects',
                            rating: 0,
                            price: 0,
                            discountPrice: 0,
                            creator: 'Sunny Maxx',slug: 'course-slug'
                        },{
                            id: 4,
                            img: '/img/test/photo1.jpeg',
                            name: 'Vue Js - The Complete Guide',
                            rating: 4.5,
                            price: 600000,
                            discountPrice: 55000,
                            creator: 'Maxximus Technologies',slug: 'course-slug'
                        },
                        {
                            id: 5,
                            img: '/img/test/photo5.jpeg',
                            name: 'React Js, Native',
                            rating: 5.0,
                            price: 2500,
                            discountPrice: 1500,
                            creator: 'Domicile Designs',slug: 'course-slug'
                        },
                        {
                            id: 6,
                            img: '/img/test/photo3.jpeg',
                            name: 'After Effects',
                            rating: 0,
                            price: 0,
                            discountPrice: 0,
                            creator: 'Sunny Maxx',slug: 'course-slug'
                        },
                        {
                            view_all: true
                        }
                    ];
                }else{
                    this.searchResult = [{
                        no_result: true
                    }];
                }
            }
        },
        unicodeToChar(text) {
            if(typeof text === 'undefined'){
                return '';
            }
            return text.replace(/\\u[\dA-F]{4}/gi,
                function (match) {
                    return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
                });
        },
        formatPrice(price){
            if(typeof price === 'undefined'){
                return 0;
            }
            if(+price <= 0){
                return 'Free';
            }
            return this.unicodeToChar('\u20A6')+price.toLocaleString('en-GB');
        },
        formatPriceV2(price){
            if(typeof price === 'undefined'){
                return this.unicodeToChar('\u20A6')+0;
            }
            if(+price <= 0){
                return this.unicodeToChar('\u20A6')+0;
            }
            return this.unicodeToChar('\u20A6')+price.toLocaleString('en-GB');
        },
        formatPriceV3(price){
            if(typeof price === 'undefined'){
                return 0;
            }
            if(+price <= 0){
                return 0;
            }
            return price.toLocaleString('en-GB');
        },
        textToSlug(s){
            return s.toString().normalize('NFD')
                .replace(/[\u0300-\u036f]/g,'')
                //.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]+/g, '')
                .replace(/--+/g,'-')
                .replace(/^-+/,'')
                .replace(/-+$/, '')
                .replaceAll('-','+');
        },
        slugToText(s){
            return s.toString().replaceAll('+',' ');
        },
        formatDate(timestamp){
            if(typeof timestamp === 'undefined' || timestamp == null){
                return null;
            }
            try{
                let date = new Date(timestamp);
                let month = date.getMonth()+1;
                return date.getFullYear()+
                    "-"+(month < 10 ? 0+''+month : month)+
                    "-"+(date.getDate()<10?0+''+date.getDate():date.getDate())+
                    " "+(date.getHours()<10?0+''+date.getHours():date.getHours())+
                    ":"+(date.getMinutes()<10?0+''+date.getMinutes():date.getMinutes());
            }catch(e){
                return null;
            }
        },
        formatDateOnly(timestamp){
            if(typeof timestamp === 'undefined' || timestamp == null){
                return null;
            }
            try{
                let date = new Date(timestamp);
                let month = date.getMonth()+1;
                return date.getFullYear()+
                    "-"+(month < 10 ? 0+''+month : month)+
                    "-"+(date.getDate()<10?0+''+date.getDate():date.getDate());
            }catch(e){
                return null;
            }
        },
        formatTimeOnly(timestamp){
            if(typeof timestamp === 'undefined' || timestamp == null){
                return null;
            }
            try{
                let date = new Date(timestamp);
                return (date.getHours()<10?0+''+date.getHours():date.getHours())+
                    ":"+(date.getMinutes()<10?0+''+date.getMinutes():date.getMinutes());
            }catch(e){
                return null;
            }
        },
        async fetchAuth(loading=true) {
            try{
                if(this.$store.state.jwt == null || this.$store.state.jwt.trim() === '') {
                    this.$store.commit('setAuth', {
                        token: '',
                        user: {}
                    });
                    this.$cookies.set('kbt','');
                    this.$store.commit('setLoadingAuth', false);
                    return;
                }
                this.$store.commit('setLoadingAuth', loading);
                let override = '';
                if(typeof this.$route.query.override === 'string' && this.$route.query.override.trim() !== ''){
                    override = '?override='+this.$route.query.override;
                }
                let response = await fetch(this.$store.state.baseUrl + 'auth'+override, {
                    headers: {
                        'Authorization': this.$store.state.jwt
                    }
                });
                let data = await response.json();
                if (data.status === 200) {
                    this.$store.commit('setAuth', {
                        token: this.$cookies.get('kbt'),
                        user: data.user
                    });
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
                }
                else if(data.status === 401 && typeof data.message !== 'undefined') {
                    this.$store.commit('setAuth', {
                        token: '',
                        user: {}
                    });
                    this.$cookies.set('kbt','');
                }
                this.$store.commit('setLoadingAuth', false);
            }catch(err){
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
                            text: 'Reload Page',
                            color: 'orange',
                            click: ()=>{
                                window.location.reload();
                            }
                        }
                    ]
                };
            }
        },
        async loadContent(page){
            try{
                let response = await fetch(this.$store.state.baseUrl + page, {
                    headers: {
                        'Authorization': this.$store.state.jwt
                    }
                });
                return await response.json();
            }catch(err){
                return err;
            }
        },
        generateRandomString(len=36){
            let text = "";
            let possible =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < len; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        },
        toFirstUpper(s){
            if(typeof s !== 'string'){
                return '';
            }
            return s.split('').map((q,i)=>{
                return i===0?q.toUpperCase():q;
            }).join('');
        },
        removeTag(str){
            if ((str===null) || (str===''))
                return '';
            else
                str = str.toString();
            return str.replace( /(<([^>]+)>)/ig, '');
        },
        formatLessonDuration(t){
            let a = '';
            let q = Math.floor(t/60);
            q = q < 10 ? "0"+q : ""+q;
            a += +q > 0 ? q+'h ' : '';
            let r = Math.floor(t%60);
            r = r < 10 ? "0"+r : ""+r;
            a += +r > 0 ? r+'m' : '';
            return a;
        },
        formatDiscountTime(t){
            if(typeof t !== 'number'){
                return '';
            }
            let tt = t;
            let a = '';
            if(tt <= 0){
                return '0d 0h 0m 0s';
            }
            let d = Math.floor(tt/86400);
            d = d < 10 ? "0"+d : d;
            a += +d > 0 ? d+'d ':'';
            tt = tt%86400;
            if(tt <= 0){
                return a+'0h 0m 0s';
            }
            let h = Math.floor(tt/3600);
            h = h < 10 ? "0"+h : h;
            a += +h > 0 ? h+'h ':'';
            tt = tt%3600;
            if(tt <= 0){
                return a+'0m 0s';
            }
            let m = Math.floor(tt/60);
            m = m < 10 ? "0"+m : m;
            a += +m > 0 ? m+'m ':'';
            let s = Math.floor(tt%60);
            if(s <= 0){
                return a+'0s';
            }
            s = s < 10 ? "0"+s : s;
            a += +s > 0 ? s+'s ':'';
            return a;
        },
        formatChatTime(t){
            if(typeof t === 'undefined' || t == null){
                return null;
            }
            try{
                let d = (Date.now() - new Date(t).getTime())/1000;
                if(d < 60){
                    return 'now';
                }
                if(d < 3600){
                    return Math.floor(d/60)+'m ago';
                }
                if(d < 86400){
                    return Math.floor(d/3600)+'h ago';
                }
                if(d < (86400 * 7)){
                    return Math.floor(d/86400)+'d ago';
                }
                if(d < (86400 * 365)){
                    return Math.floor(d/(86400*7))+'w ago';
                }
                if(d > (86400 * 365)){
                    return Math.floor(d/(86400 * 365))+'y ago';
                }
            }catch(e){
                return null;
            }
        },
        logoutDialog(){
            this.customDialog = {
                show: true,
                persistent: true,
                text: 'Are you sure you want to logout from this account?',
                icon: '',
                buttons: [
                    {
                        text: 'Cancel',
                        color: 'orange',
                        click: ()=>{
                            this.customDialog.show = false;
                        }
                    },

                    {
                        text: 'Logout',
                        color: 'red',
                        click: ()=>{
                            this.customDialog.show = false;
                            this.logout();
                        }
                    },
                ]
            };
        },
        logout(){
            try{
                fetch(this.$store.state.baseUrl + 'auth', {
                    method: 'delete',
                    headers: {
                        'Authorization': this.$store.state.jwt
                    }
                }).then(r =>{});
                this.$router.push('/login?goto='+this.formatPath());
            }catch(e){

            }
        },
        formatDateTime(str){
            let date = new Date(str);
            return this.$moment(date).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('MM/DD/YYYY HH:mm:ss')
        },
        formatTimestamp(str){
            return new Date(this.formatDateTime(str)).getTime();
        },
        getISOString(str){
            let date = this.formatDateTime(str).split(' ')[0].split('/');
            return date[2]+'-'+date[0]+'-'+date[1];
        },
        isoToLocale(str){
            let tz = new Date().getTimezoneOffset();
            let date = new Date(str).getTime() - (60000 * tz);
            return this.formatDateTime(date);
        },
        formatPath(){
            let queries = this.$route.query;
            let n = '';
            if(typeof queries === 'object'){
                let i = 0;
                for(const key in queries){
                    if(i === 0){
                        n += '?'+key+'='+queries[key];
                    }else{
                        n += '&'+key+'='+queries[key];
                    }
                    i++;
                }
            }
            return this.$route.path+n;
        },
        isJSONString(str){
            try{
                JSON.parse(str);
            }catch(e){
                return false;
            }
            return true;
        },
        debounce(fn, wait){
            let timer;
            return function(...args){
                if(timer) {
                    clearTimeout(timer); // clear any pre-existing timer
                }
                const context = this; // get the current context
                timer = setTimeout(()=>{
                    fn.apply(context, args); // call the function if time expires
                }, wait);
            }
        },
        onCopySuccess(){

        },
        onCopyError(){

        }
    }
}