import {createRouter,createWebHashHistory} from "vue-router";
import myfile from '../views/home.vue'

const routes= [

    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        component: myfile,
        redirect: "/home/mine",
        children:[
            {
                path:'/home/mine',
                component: () => import ('../views/mine.vue')
            },
            {
                path:'/home/upload',
                component: () => import ('../views/upload.vue')
            },
            {
                path:'/home/browse',
                component: () => import ('../views/browse.vue')
            },
            {
                path:'/home/check',
                component: () => import ('../views/check.vue')
            },
            // {
            //     path:'/home/temp',
            //     component: () => import ('../views/temp.vue')
            // },
        ]
    },


]

const router=createRouter({
    history:createWebHashHistory(),
    routes
})

export default router
