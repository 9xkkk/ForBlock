<script setup>
   import {ref,reactive} from 'vue'
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
        ElCard,
        ElMessage,
        ElButton,
        ElTable,
        ElTableColumn,
        ElUpload,
        ElMessageBox,
        ElInput,
        ElRadioGroup,
        ElRadio,
        ElDescriptions,
        ElDescriptionsItem,
    ElDialog,
    ElLoading

    } from 'element-plus'; 
    import axios from 'axios'

    const fileList=[]
    const radio=ref('')
    const sender=ref('')
    const receiver=ref('')
    const time=ref('')
    const variety=ref('')
    const status=ref('')
    const dialogVisible = ref(false)
    const showline=ref(false)


    const tableData2=ref([])
    const type=ref('')
    const hash=ref("")
    const finger=ref("")


    const filedata=ref({})

    const link=ref('')
    const link2=ref('')
    const checkdata=ref([])

    let brr
    

    
    const handleAvatarSuccess=(response, uploadFile)=> {
        console.log(response,uploadFile)
       
       
    }
    const handleRemove = (file, uploadFiles) => {
        console.log(file, uploadFiles)
       
    }
    const handleClose = (done) => {
    dialogVisible.value = false
}

    







    //上传文件
    const beforeUpload=(file)=>{
        console.log('111');
        axios.post("/verify/upload2",{
            "FileVerify":file
        },{
            //表单类型
            headers: {'Content-Type': 'multipart/form-data'}
        }).then(res=>{
         
            
              console.log(res);
            type.value=res.data.type
            console.log(type);

            ElMessage({
    message: '上传成功',
    type: 'success',
  })
        }).catch(err=>{
            ElMessage({
    message: '上传失败',
    type: 'warning',
  })
        })
       
       
    }
    //提取指纹
    const fingerprints=()=>{

        //loading
        const loading = ElLoading.service({
    lock: true,
    text: '正在提取中',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  setTimeout(() => {
    loading.close()
  }, 3000)


        axios.get(`/verify/fingerprint/${type.value}`).then(res => {
            console.log(res);   
            hash.value=res.data.filetxHash
            finger.value=res.data.fingerprint

    })
    }


    //链上追溯
    const trace=()=>{
        
        axios.get(`/verify/traceback/${hash.value}/${radio.value}`).then(res => {
       
       filedata.value=JSON.stringify(res.data.filedata)
     
       checkdata.value=res.data.checkdata


            //对checkdata时间排序
             brr=checkdata.value
             console.log(brr)
       brr.sort((a,b)=>{
        const TimeA=new Date(a[2]);
        const TimeB=new Date(b[2]);
        return TimeB-TimeA;
       })
       console.log(brr)


       //共享类型
       for (let i = 0; i < brr.length; i++) {
        if (brr[i][3]==5) {
            brr[i][3]='可用可转发'
        }else{
            brr[i][3]='可用不可转发'

        }
        
       }







            //可视化视图
       let arr = checkdata.value
       console.log(arr);
      //节点排序
       let result = [];
       let tmp = [];
        let senders = arr.map(item => item[0]);
        let receivers = arr.map(item => item[1]);
        console.log(arr)
        let start = senders.find(sender => !receivers.includes(sender));//起始节点
        result.push(start)
        const findReceiver=(sender)=>{
            for(let i=0;i<arr.length;i++){
                if(arr[i][0]===sender){
                    const receiver = arr[i][1];
                    if (!result.includes(receiver)) {//节点不重复出现
                        console.log(i)
                        tmp.push({name: receiver, status: arr[i][3]})
                        result.push(receiver);
                        findReceiver(receiver);
                    }
                   // result.push(arr[i][1]);
                    //findReceiver(arr[i][1]);

                }

            }


        }
        findReceiver(start)

        
        //样式判断
        let tmp_str = ''
        let img_str = '<span class="custom-dot"></span>'
        for (let k in tmp) {
            console.log(tmp[k], tmp[k].status)
            if (tmp[k].status == '可用可转发' && k == 0) {
                img_str +='<span class="custom-arrow1"></span>'+'<span class="custom-dot"></span>'
                 tmp_str +='<b><span class="large-text">' +  result[0] + '</span></b>' + '<span class="custom-space"></span><b><span class="large-text">' + tmp[k].name + '</span></b>'
            } else if (tmp[k].status == '可用不可转发' && k == 0) {
                img_str +='<span class="custom-arrow2"></span>'+'<span class="custom-dot"></span>'
                tmp_str +='<b><span class="large-text">' + result[0] + '</span></b>'+ '<span class="custom-space"></span><b><span class="large-text">' + tmp[k].name+ '</span></b>'
            } else {
                if (tmp[k].status == '可用可转发') {
                    img_str +='<span class="custom-arrow1"></span>'+'<span class="custom-dot"></span>'
                    tmp_str += '<span class="custom-space"></span><b><span class="large-text">'+tmp[k].name + '</span></b>'
                } else if (tmp[k].status == '可用不可转发') {
                    img_str +='<span class="custom-arrow2"></span>'+'<span class="custom-dot"></span>'
                    tmp_str += '<span class="custom-space"></span><b><span class="large-text1">'+tmp[k].name + '</span></b>'
                }
            }

            console.log(tmp_str)

        }

        link.value=img_str
        link2.value = tmp_str

        console.log(tmp)

        console.log(tmp_str)

        var s = ''
         
        // for (let k in cd) {
        //     console.log(cd[k])
        //     // if (cd[k][3] == '5') {
                
        //     // }
        //     let firstEle = ''
            
        // }


       showline.value=true
       
    })
    }

    


   
</script>



<template>
    <div class="check">
       
        <el-dialog v-model="dialogVisible" title="details" width="40%" :before-close="handleClose">
            <div >
 
                    <el-input type="textarea"  v-model="filedata" disabled  />
                
             
            </div>
            
        </el-dialog>

        

        <el-card>
            <div class="header">
                <div style="display: flex;justify-content: center;">
                    <el-upload
                            v-model:file-list="fileList"
                            class="upload-demo"
                            action=""
                            :limit="1" 
                            style="display: flex;width: 500px;"
                    
                            :on-success="handleAvatarSuccess"
                            :on-remove="handleRemove"      
                            :before-upload="beforeUpload"
                            :on-preview="handlePreview"
                    >
                        <el-button type="primary" >上传文件</el-button>
                    </el-upload>
                </div>
                <div style="display: flex;justify-content: center;margin: 16px 0;">
                    <div style="width: 500px;display: flex;">
                        <el-button type="success" @click="fingerprints()">提取指纹</el-button>
                        <el-input style="width: 300px;margin-left: 20px" v-model="finger"></el-input>
                    </div>
                </div>
                <div style="display: flex;justify-content: center;margin: 16px 0;">
                    <div style="width: 500px;display: flex;">
                        <el-button type="warning" @click="trace()">链上追溯</el-button>
                        <el-radio-group  class="ml-4" style="margin-left: 20px;" v-model="radio">
                            <el-radio label="A">A</el-radio>
                            <el-radio label="B">B</el-radio>
                            <el-radio label="C">C</el-radio>
                            <el-radio label="D">D</el-radio>
                            <el-radio label="E">E</el-radio>
                            <el-radio label="F">公开</el-radio>
                        </el-radio-group>
                    </div>
                </div>

            </div>
        </el-card>


        <div v-show="showline==true" style="height: 240px;" >
            <div style="display: flex;justify-content: center;align-items: flex-end;height: 120px;"  v-html="link">
            </div>

            <div style="display: flex;justify-content: center;align-items: center;height: 60px;"  v-html="link2">
            </div>
        </div>


        <div class="con" style="display: flex;justify-content: center;align-items: center;" v-for="(item,index) in brr" :key="item[2]">

<el-card style="width: 100%;padding: 0 25%;" >
    <el-descriptions :column="2" size="large" class="mt-4" style="display: flex;justify-content: center;">
        <el-descriptions-item width="200px" label="发送方"  
        >{{ item[0] }}</el-descriptions-item>

        <el-descriptions-item width="200px" label="时间" 
        >{{ item[2]}}</el-descriptions-item
        >

        <el-descriptions-item width="200px" label="接收方" >{{ item[1] }}</el-descriptions-item>
        
        <el-descriptions-item width="200px" label="共享类型" >
            {{ item[3] }}
        </el-descriptions-item>
    </el-descriptions>
</el-card>

        </div>
        <div class="button">
            <el-button  type="success"  @click="dialogVisible=true">详细信息</el-button>             
        </div>
    </div> 
</template>



<style lang="scss">
    .check{
        height: 100%;
        width: 100%;
        .header{
            /*display: flex;*/
            /*justify-content: center;*/
        }
        .el-upload-list{
            width: 300px !important;
        }
        
        .con{
            width: 100%;
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
        }
        .el-descriptions__label{
            font-size: 20px !important;
            font-weight: bold;
        }
        .button{
            text-align: center;
            margin-top: 20px;

        }
        .large-text {
            font-size: 30px; 
        }
        .custom-dot {
            width: 22px; 
        height: 22px;
        background-image: url(../images/图片4.png); 
        background-size: cover; 
        
        
        }
        .custom-arrow1{
            width: 185px; 
        height: 22px;
        background-image: url(../images/green.jpg); 
        background-size: cover; 
        display: inline-block;
        background-position: right;

        }
        .custom-arrow2{
            width: 185px; 
        height: 22px;
        background-image: url(../images/red.jpg); 
        background-size: cover; 
        display: inline-block;
        background-position: right;

        }
        .custom-space{
            width: 185px; 
        height: 30px;
        background-image: url(../images/space.jpg); 
        background-size: cover; 
        display: inline-block;
        background-position: right;


        }

    }   
        
</style>
