<template>
  <div>
    <el-row>
      <el-col :span="14" style="background-color: #222222">
        <!-- 只显示当前选定的图片 -->
        <div  class="image-container" ref="imageContainer"> <!-- 添加新的包裹容器 -->
          <div  class="thumbnail" >
            <img :src="currentImageUrl" :alt="`Thumbnail for ${currentImageUrl}`" :style="{ height: imageHeight + 'px' }" @load="onImageLoaded">
          </div>
        </div>

      </el-col>
      <el-col :span="10" style="background-color: rgba(151,168,190,0.55);height: 100vh;">
        <h1 style="text-align: center">MangaOcr+Google/Baidu</h1>

        <!-- 分页组件 -->
        <el-pagination
          style="text-align: center;padding: 5px"
          background
          @current-change="handlePageChange"
          :current-page="currentPage"
          :page-size="1"
          layout="prev, pager, next,jumper"
          :total="imageUrls.length">
        </el-pagination>
        <div style="text-align: center;padding: 10px">

          <el-button type="success" @click="takeScreenshot">---- 截图 ----</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button type="warning" @click="triggerFileInput">选择文件夹</el-button>
          <input type="file" @change="handleFiles" webkitdirectory directory multiple style="display: none" ref="fileInput">
        </div>
        <div style="display: flex; justify-content: center;"> <!-- 外部容器用于居中 -->
          <div style="display: flex; align-items: center; width: 70%;"> <!-- 内部容器占宽度 70% -->

            <el-button color="#1dd0a1" circle style="margin-right: 5px" @click="zoomOut">
              <svg class="icon" aria-hidden="true" style="color: white; width: 15px; height: 15px;">
                <use xlink:href="#yw-icon-minus-bold"></use>
              </svg>
            </el-button>
            <el-slider
              style="flex-grow: 1; margin: 0 10px;"
              v-model="scale"
              @input="handleSliderChange"
              :min="1"
              :max="15"
              :step="1"
              show-stops>
            </el-slider>
            <el-button color="#1dd0a1" circle style="margin-left: 5px" @click="zoomIn">
              <svg class="icon" aria-hidden="true" style="color: white; width: 15px; height: 15px;">
                <use xlink:href="#yw-icon-add"></use>
              </svg>
            </el-button>
          </div>
        </div>

        <div>
          <el-form  label-width="80px" style="padding: 10px">
            <el-form-item label="编辑内容" >
              <el-input type="textarea" v-model="detectText"></el-input>
            </el-form-item>
            <el-form-item label="翻译结果">
              <p id="trans-text">{{transText}}</p>
            </el-form-item>
          </el-form>
        </div>

      </el-col>
    </el-row>
  </div>
</template>

<script>
import { Pagination } from 'element-ui';
import ScreenShot from 'js-web-screen-shot';
import { mapState, mapActions } from 'vuex'
import axios from 'axios';
import md5 from 'md5'; // 确保安装了md5库

export default {
  components: {
    'el-pagination': Pagination
  },
  data() {
    return {
      imageUrls: [],
      currentPage: 1, // 当前页
      currentImageUrl: '', // 当前显示的图片URL
      detectText: '',
      transText:'',
      originalImageHeight: 0, // 用于存储图片的原始高度
      scale: 5, // 初始缩放比例
      imageHeight: 0, // 初始值设置为0，将在mounted中设置
    };
  },

  mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    ...mapActions('ocr', ['detectImage']),
    triggerFileInput() {
      this.$refs.fileInput.click(); // 触发文件输入的点击事件
    },
    handleFiles(event) {
      const selectedFiles = event.target.files;
      this.imageUrls = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        if (selectedFiles[i].type.match('image.*')) {
          const imageUrl = URL.createObjectURL(selectedFiles[i]);
          this.imageUrls.push(imageUrl);
        }
      }
      this.currentPage = 1; // 重置当前页
      this.updateCurrentImage();
    },
    takeScreenshot() {
      const config = {
        completeCallback: ({ base64, cutInfo }) => {
          console.log(cutInfo)
          console.log('截图完成')
          base64 = base64.split(';base64,').pop()

          let formData = new FormData();
          formData.append('base64_str', base64); // 'base64_str' 是后端期待的字段名

          this.detectImage(formData).then((response) => {
            console.log(response)
            this.detectText = response
            this.translateTextByGoogle(this.detectText)
            // console.log(this.transText)
          })
        },
        enableWebRtc: false,
        // screenShotDom: document.getElementById("img-box")
      };
      new ScreenShot(config);
    },
    handlePageChange(pageNumber) {
      this.currentPage = pageNumber;
      this.updateCurrentImage();
    },
    updateCurrentImage() {
      this.currentImageUrl = this.imageUrls[this.currentPage - 1] || '';
    },
    handleKeyDown(e) {
      switch(e.keyCode) {
        case 37: // 左箭头
          this.changePage(-1);
          break;
        case 39: // 右箭头
          this.changePage(1);
          break;
      }
    },
    generateSalt() {
      return Math.floor(Math.random() * 10000) + Date.now().toString();
    },
    changePage(delta) {
      const newPage = this.currentPage + delta;
      if (newPage >= 1 && newPage <= this.imageUrls.length) {
        this.currentPage = newPage;
        this.updateCurrentImage();
      }
    },
    async translateTextByBaidu(q) {
      const appid = '20210428000807031'; // 您的appid
      const key = 'VCgZ7qJlk9iMtvzulaa0'; // 您的密钥
      const from = 'jp';
      const to = 'zh';
      const salt = this.generateSalt(); // 获取随机盐值

      // Step1: 拼接字符串
      const str1 = `${appid}${q}${salt}${key}`;

      // Step2: 计算签名
      const sign = md5(str1);

      // 拼接完整的请求URL
      const url = `/baidu-translate-api/api/trans/vip/translate`;
      const params = { q, from, to, appid, salt, sign };

      try {
        const response = await axios.get(url, { params });
        console.log(response.data.trans_result[0].dst);
        this.transText=response.data.trans_result[0].dst
        // return response.data.trans_result[0].dst
        // 处理响应
      } catch (error) {
        console.error('翻译请求错误: ', error);
      }
    },
    // 方法：发送翻译请求到Google翻译API
    async translateTextByGoogle(text) {
      const apiKey = 'AIzaSyDW9HXRXTfuMnQXSM9xKi8pV5wEg-00BY0';
      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

      try {
        const response = await axios.post(url, {
          q: text,
          source: 'ja', // 源语言
          target: 'zh', // 目标语言
          format: 'text' // 文本格式
        });
        this.transText=response.data.data.translations[0].translatedText
        return response.data.data.translations[0].translatedText;
      } catch (error) {
        console.error('翻译错误:', error);
        throw error;
      }
    },
    onImageLoaded(event) {
      const container = this.$refs.imageContainer;
      this.originalImageHeight = container.clientHeight; // 存储容器的初始高度
      this.updateImageHeight(); // 根据初始缩放级别更新图片高度
    },
    updateImageHeight() {
      this.imageHeight = this.originalImageHeight * (this.scale / 5);
    },
    zoomIn() {
      if (this.scale < 15) {
        this.scale += 1;
        this.updateImageHeight();
      }
    },
    zoomOut() {
      if (this.scale > 1) {
        this.scale -= 1;
        this.updateImageHeight();
      }
    },
    handleSliderChange(newScale) {
      if (newScale >= 1 && newScale <= 15) {
        this.scale = newScale;
        this.updateImageHeight();
      }
    }

  }
};
</script>

<style>
.thumbnail {
  //width: 50%; /* 调整为100% */
  padding: 5px;
}

.image-container {
  height: 100vh; /* 设置容器高度为视窗高度 */
  overflow: auto; /* 添加滚动条 */
  display: grid;
  place-items: center;
}

.thumbnail img {
  object-fit: contain;
  display: block; /* 防止图片下方出现空隙 */
}

#trans-text {
  margin-block-start: 0px;
  margin-block-end: 0px;
  font-size: 15px;
  font-weight: bold; /* 使文本加粗 */
}
</style>
