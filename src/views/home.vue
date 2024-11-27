<script setup>
import { ref ,computed } from 'vue'
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
    ElMessage,
    ElScrollbar
} from 'element-plus';
import { useRouter, RouterView } from 'vue-router'
import { User, UploadFilled, View, Aim, Histogram } from '@element-plus/icons-vue'
import emitter from '../plugins/bus.js'


const active = ref(1)
const n = ref('')




const onBeforeMount = () => {
    emitter.on('fn', e => {
        n.value = e.value
    })
}

const nodePrefix = computed(() => {
    if (n.value === 'A') return '车企'
    if (n.value === 'B') return '车企'
    if (n.value === 'C') return '设备制造商'
    if (n.value === 'D') return '电网企业'
    if (n.value === 'E') return '充电设备运营商'
    return '节点' // 默认前缀
})
onBeforeMount()


const handleOpen = (key, keyPath) => {
    console.log(key, keyPath)
}
const handleSelect = (key, keyPath) => {
    console.log(key, keyPath)
    active.value = key
}
const handleClose = (key, keyPath) => {
    console.log(key, keyPath)
}
</script>

<template>
    <div class="home">
        <el-container>

            <el-header style="background-color: rgba(84, 92, 100, 0.9); height: 80px;">
                <div class="web-title">基于权限标识的跨系统隐私数据共享和溯源平台</div>
            </el-header>

            <el-container>
                <el-aside width="200px">
                    <!-- 侧边栏内容 -->
                    <el-row class="tac">
                        <el-col>
                            <el-menu :default-active="1" active-text-color="#fff"
                                background-color="rgba(84, 92, 100, 0.9)" class="el-menu-vertical-demo"
                                text-color="#fff" @open="handleOpen" @close="handleClose" @select="handleSelect">
                                <el-menu-item index="1"
                                    style="display: flex;justify-content: center;font-size: 20px;align-items: center;height: 70px; "
                                    disabled>
                                    <div
                                        style="display: flex;width: auto;justify-content: center;align-items: center;margin-left: 0; font-weight: bold; font-style: italic; ">
                                        {{ nodePrefix }}{{ n }}
                                    </div>
                                </el-menu-item>

                                <router-link to="/home/mine">
                                    <el-menu-item index="2"
                                        style="display: flex;justify-content: center;font-size: 24px;align-items: center;height: 70px;">
                                        <div
                                            style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 10%;">
                                            <div
                                                style="display: flex;justify-content: flex-start; align-items: center;">
                                                <el-icon style="display: flex;align-items: center;margin-right: 10px">
                                                    <User class="my-icon" />
                                                </el-icon>
                                                个人中心
                                            </div>
                                        </div>
                                    </el-menu-item>
                                </router-link>
                                <router-link to="/home/upload">
                                    <el-menu-item index="3"
                                        style="display: flex;justify-content: center;font-size: 24px;align-items: center;height: 70px;">
                                        <div
                                            style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 10%;">
                                            <el-icon style="display: flex;align-items: center;margin-right: 10px">
                                                <UploadFilled class="my-icon" />
                                            </el-icon>
                                            文件上传
                                        </div>
                                    </el-menu-item>
                                </router-link>

                                <router-link to="/home/browse">
                                    <el-menu-item index="4"
                                        style="display: flex;justify-content: center;font-size: 24px;align-items: center;height: 70px;">
                                        <div
                                            style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 10%;">
                                            <el-icon style="display: flex;align-items: center;margin-right: 10px">
                                                <View class="my-icon" />
                                            </el-icon>
                                            文件浏览
                                        </div>
                                    </el-menu-item>
                                </router-link>

                                <router-link to="/home/check">
                                    <el-menu-item index="5"
                                        style="display: flex;justify-content: center;font-size: 24px;align-items: center;height: 70px;">
                                        <div
                                            style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 10%;">
                                            <el-icon style="display: flex;align-items: center;margin-right: 10px">
                                                <Aim class="my-icon" />
                                            </el-icon>
                                            文件追溯
                                        </div>
                                    </el-menu-item>
                                </router-link>

                                <router-link to="/home/utility">
                                    <el-menu-item index="6"
                                        style="display: flex;justify-content: center;font-size: 24px;align-items: center;height: 70px;">
                                        <div
                                            style="display: flex;width: 100%;justify-content: flex-start;align-items: center;margin-left: 10%;">
                                            <el-icon style="display: flex;align-items: center;margin-right: 10px">
                                                <Histogram class="my-icon" />
                                            </el-icon>
                                            效用分析
                                        </div>
                                    </el-menu-item>
                                </router-link>

                            </el-menu>
                        </el-col>
                    </el-row>
                </el-aside>

                <el-main>
                    <el-scrollbar height="800px">
                        <!-- 内容区域 -->
                        <!-- 内容区域内容 -->
                        <RouterView></RouterView>
                    </el-scrollbar>
                </el-main>
            </el-container>

        </el-container>
    </div>
</template>




<style lang="scss" scoped>
.home {
    z-index: 1;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    overflow: hidden;
    // background: #f4f4f4;

    .web-title {
        font-size: 30px;
        font-weight: bold;
        color: #f4f4f4;
        margin: 20px 0 0 200px; //上右下左          
    }

    .my-icon {
        width: 20px !important;
        height: 20px !important;
        color: #f7f7f7;
        /* 图标颜色 */
    }

    .tac {
        min-height: 100vh;
        height: 100%;
    }

    .el-menu {
        height: 100%;
        border-right: 1px solid #ddd;
        /* 为侧边栏添加一个分割线 */
    }

    .el-menu-item {
        padding: 10px 20px;
        /* 调整菜单项的内边距 */
        transition: background-color 0.3s ease;
        /* 鼠标悬浮时添加平滑的过渡效果 */
    }

    .el-menu-item:hover {
        background-color: #1abc9c;
        /* 鼠标悬浮时的背景颜色 */
        transform: scale(1.05);
        /* 鼠标悬停时放大效果 */
    }

    .el-menu-item.is-active {
        background-color: #34495e !important;
        /* 改变选中项的背景色 */
        border-right: 5px solid #42b983;
        /* 增加右边的高亮边框 */
    }


    .el-main {
        background: transparent;
        padding: 20px;
        /* 主内容区域的内边距 */
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        /* 给内容区加阴影 */
    }

    .bgJpg {
        background-image: url('public/1.jpg');
        background-repeat: no-repeat;
        /* 禁止图片平铺 */
        background-size: cover;
        /* 根据容器尺寸裁切或拉伸图片 */
        background-position: center;
        /* 图片居中显示 */
    }
}
</style>
