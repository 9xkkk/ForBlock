<script setup>
    import { ref } from 'vue'
    import {
        ElAside,
        ElContainer,
        ElHeader,
        ElMain,
        ElMenu,
        ElSubMenu,
        ElMenuItemGroup,
        ElMenuItem,
        ElRow,
        ElCol,
        ElMessage
    } from 'element-plus';
    import {useRouter,RouterView} from 'vue-router'
    import {
        Document,
        Menu as IconMenu,
        Location,
        Setting,
        Star
    } from '@element-plus/icons-vue'
    import emitter from '../plugins/bus.js'


    const active=ref(1)
    const n=ref('')

    const onBeforeMount =()=>{
        emitter.on('fn',e=>{
            n.value=e.value
        })

    }
    onBeforeMount()
    
    

    

    const handleOpen = (key,keyPath) => {
        console.log(key, keyPath)
    }
    const handleSelect = (key, keyPath) => {
        console.log(key, keyPath)
        active.value=key
    }
    const handleClose = (key,keyPath) => {
        console.log(key, keyPath)
    }

    
    


</script>

<template>
    <div class="home">
        <el-aside width="200px">
            <!-- 侧边栏内容 -->
            <el-row class="tac" >
                <el-col >
                    <el-menu
                            :default-active="1"
                            active-text-color="#ffd04b"
                            background-color="#545c64"
                            class="el-menu-vertical-demo"
                            text-color="#fff"
                            @open="handleOpen"
                            @close="handleClose"
                            @select="handleSelect"
                    >   
                        <el-menu-item index="1" style="display: flex;justify-content: center;font-size: 24px;align-items: center;height: 70px; " disabled>
                            <div style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 30%; font-weight: bold; font-style: italic; " >
                                节点{{ n }}
                                
                            </div>
                        </el-menu-item>
                        <router-link to="/home/mine">
                            <el-menu-item index="2" style="display: flex;justify-content: center;font-size: 24px;align-items: center;height: 70px;">
                            <div style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 30%;">
                                    <div style="display: flex;justify-content: flex-start">
                                        我的
                                        <el-icon v-show="active==2" style="display: flex;align-items: center;margin-left: 5px"><Star class="my-icon" /></el-icon>
                                    </div>
                            </div>
                        </el-menu-item>
                        </router-link>
                        <router-link to="/home/upload"><el-menu-item index="3" style="display: flex;justify-content: center;font-size: 24px;align-items: center;height: 70px;">
                            <div style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 30%;">
                                上传
                               <el-icon v-show="active==3" style="display: flex;align-items: center;margin-left: 5px"><Star class="my-icon" /></el-icon>
                            </div>
                        </el-menu-item>
                        </router-link>
                        <router-link to="/home/browse">
                        <el-menu-item index="4" style="display: flex;justify-content: center;font-size: 24px;align-items: center;eight: 70px;">
                            <div style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 30%;">
                                浏览
                                <el-icon v-show="active==4" style="display: flex;align-items: center;margin-left: 5px"><Star class="my-icon" /></el-icon>
                            </div>
                        </el-menu-item>
                        </router-link>
                        <router-link to="/home/check">
                        <el-menu-item index="5" style="display: flex;justify-content: center;font-size: 24px;align-items: center;height: 70px;">
                            <div style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 30%;">
                                校验
                                <el-icon v-show="active==5" style="display: flex;align-items: center;margin-left: 5px"><Star class="my-icon" /></el-icon>
                            </div>
                        </el-menu-item>
                        
                        </router-link>
                         
                    </el-menu>
                   
                </el-col>
            </el-row>
        </el-aside>
        <el-main>
            <!-- 内容区域 -->
            <el-container>
                <!-- 内容区域内容 -->
                <RouterView></RouterView>
            </el-container>
        </el-main>
    </div>
</template>




<style lang="scss" scoped>

    .home{
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        overflow: hidden;
    .my-icon {
        width: 20px !important;
        height: 20px !important;
    }
        .tac{
            min-height: 100vh;
            height: 100%;
        }
        .el-menu{
            height: 100%;
        }
    }
</style>
