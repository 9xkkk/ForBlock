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
    import {User, UploadFilled, View, Aim, Histogram} from '@element-plus/icons-vue'    
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
        <el-container>

            <el-header style="background-color: #545c64; height: 80px;">
                <div class="web-title">基于云链聚合的隐私保护数据共享与溯源平台</div>
            </el-header>

            <el-container> 
            <el-aside width="200px">
                <!-- 侧边栏内容 -->
                <el-row class="tac" >
                    <el-col >
                        <el-menu
                                :default-active="1"
                                active-text-color="#fff"
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
                                <div style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 10%;">
                                        <div style="display: flex;justify-content: flex-start; align-items: center;">
                                            <el-icon  style="display: flex;align-items: center;margin-right: 10px"><User class="my-icon" /></el-icon>
                                            个人中心
                                            
                                        </div>
                                </div>
                            </el-menu-item>
                            </router-link>
                            <router-link to="/home/upload">
                            <el-menu-item index="3" style="display: flex;justify-content: center;font-size: 24px;align-items: center;height: 70px;">
                                <div style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 10%;">
                                    <el-icon  style="display: flex;align-items: center;margin-right: 10px"><UploadFilled class="my-icon" /></el-icon>
                                    文件上传
                                
                                </div>
                            </el-menu-item>
                            </router-link>

                            <router-link to="/home/browse">
                            <el-menu-item index="4" style="display: flex;justify-content: center;font-size: 24px;align-items: center;height: 70px;">
                                <div style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 10%;">
                                    <el-icon  style="display: flex;align-items: center;margin-right: 10px"><View class="my-icon" /></el-icon>
                                    文件浏览
                                    
                                </div>
                            </el-menu-item>
                            </router-link>

                            <router-link to="/home/check">
                            <el-menu-item index="5" style="display: flex;justify-content: center;font-size: 24px;align-items: center;height: 70px;">
                                <div style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 10%;">
                                    <el-icon  style="display: flex;align-items: center;margin-right: 10px"><Aim class="my-icon" /></el-icon>
                                    文件追溯
                                    
                                </div>
                            </el-menu-item>                          
                            </router-link>

                            <router-link to="/home/utility">
                            <el-menu-item index="6" style="display: flex;justify-content: center;font-size: 24px;align-items: center;height: 70px;">
                                <div style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 10%;">
                                    <el-icon  style="display: flex;align-items: center;margin-right: 10px"><Histogram class="my-icon" /></el-icon>
                                    效用分析
                                    
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
            </el-container>

        </el-container>
    </div>
</template>




<style lang="scss" scoped>

    .home{
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        overflow: hidden;
        background: #f4f4f4; /* 为整体页面设置一个淡色背景 */
        .web-title{
            font-size: 30px;
            font-weight: bold;
            color: #f4f4f4;
            margin: 20px 0 0 200px;  //上右下左          
        }
        .my-icon {
            width: 20px !important;
            height: 20px !important;
            color: #f7f7f7; /* 图标颜色 */
        }
        .tac{
            min-height: 100vh;
            height: 100%;
        }
        .el-menu{
            height: 100%;
            border-right: 1px solid #ddd; /* 为侧边栏添加一个分割线 */
        }
        .el-menu-item {
            padding: 10px 20px; /* 调整菜单项的内边距 */
            transition: background-color 0.3s ease; /* 鼠标悬浮时添加平滑的过渡效果 */
        }

        .el-menu-item:hover {
            background-color: #1abc9c; /* 鼠标悬浮时的背景颜色 */
            transform: scale(1.05); /* 鼠标悬停时放大效果 */
        }
        .el-menu-item.is-active {
            background-color: #34495e !important; /* 改变选中项的背景色 */
            border-right: 5px solid #42b983; /* 增加右边的高亮边框 */
        }


        .el-main {
            background: #ffffff; /* 主内容区域的背景 */
            padding: 20px; /* 主内容区域的内边距 */
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 给内容区加阴影 */
        }
    }
</style>
