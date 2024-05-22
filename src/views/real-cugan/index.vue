<template>
  <div>
    <h1 style="text-align: center">Real-Cugan Super Resolution</h1>

    <div>
      <el-form ref="form"  style="padding: 10px" :inline="true">

        <el-form-item >
          <el-button type="warning" @click="triggerFileInput">Select IMG</el-button>
          <input type="file" @change="uploadFile" accept="image/*" style="display: none" ref="fileInput">
        </el-form-item>
        <br>


        <el-form-item label="Super resolution scale:">
          <el-input-number v-model="requestParams.scale" :min="2" :max="4" @change="onScaleChange"></el-input-number>
        </el-form-item>

        <el-form-item label="denoise_level:">
          <el-select v-model="requestParams.denoise_level" placeholder="请选择">
            <el-option
              v-for="item in denoiseOptions"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Tile:">
          <el-input-number v-model="requestParams.tile" :min="0" :max="10"></el-input-number>
        </el-form-item>

        <el-form-item label="device:">
          <el-radio-group v-model="requestParams.device">
            <el-radio label="cpu">CPU</el-radio>
            <el-radio label="cuda:0">CUDA:0</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="cache mode:">
          <el-select v-model="requestParams.cache_mode" placeholder="请选择">
            <el-option
              v-for="item in [0, 1, 2, 3]"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Alpha:">
          <el-input-number v-model="requestParams.alpha" :min="0.7" :max="1.3" :step="0.1"></el-input-number>
        </el-form-item>

        <br>
        <el-form-item>
          <el-button type="primary" @click="performSuperResolution">Start Predict</el-button>
          <el-button @click="resetRequestParams">Reset Parameters</el-button>
        </el-form-item>
      </el-form>

    </div>



    <div>
      <div style="padding: 10px;float: left;width: 50%; height: 50vh;">
        <el-image  :src="originImage"  style="height: 100%;width: 100%;background-color: #5a5e66" fit="contain" :preview-src-list="[processedImage,originImage]">
          <div slot="error" style="display: flex; justify-content: center; align-items: center; height: 100%;">
            Original Image
          </div>
        </el-image>
      </div>
      <div style="padding: 10px;float: left;width: 50%; height: 50vh;">
        <el-image   v-loading="loading"  :src="processedImage"  style="height: 100%;width: 100%;background-color: #5a5e66" fit="contain" :preview-src-list="[processedImage,originImage]">
          <div slot="error" style="display: flex; justify-content: center; align-items: center; height: 100%;">
            Super Resolution Image
          </div>
        </el-image>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      processedImage: '',
      originImage: '',
      requestParams: {
        input_path: '',
        scale: 2,
        denoise_level: 3,
        tile: 5,
        alpha: 1.0,
        half: true,
        cache_mode: 1,
        device: 'cuda:0'
      },
      loading: false,
      denoiseOptions: [0, 1, 2, 3, 4]
    }
  },
  methods: {
    ...mapActions('super_resolution', ['doUpload', 'doSuperResolution']),
    // 定义默认的 requestParams
    getDefaultRequestParams() {
      return {
        input_path: '',
        scale: 2,
        denoise_level: 3,
        tile: 5,
        alpha: 1.0,
        half: true,
        cache_mode: 1,
        device: 'cuda:0'
      };
    },
    // 重置 requestParams
    resetRequestParams() {
      this.requestParams = this.getDefaultRequestParams();
      // 同时重置初始图和超分图URL
      this.processedImage=''
      this.originImage=''
    },
    onScaleChange() {
      if (this.requestParams.scale >= 3) {
        this.denoiseOptions = [0, 3, 4];
        if (!this.denoiseOptions.includes(this.requestParams.denoise_level)) {
          this.requestParams.denoise_level = 0;
        }
      } else {
        this.denoiseOptions = [0, 1, 2, 3, 4];
      }
    },
    onFileChange(e) {
      const file = e.target.files[0];
      this.requestParams.input_path = URL.createObjectURL(file);
    },
    async performSuperResolution() {
      this.loading=true
      try {
        const processResponse = await this.doSuperResolution(this.requestParams);
        console.log(processResponse)
        this.processedImage = processResponse.output_url;
      } catch (error) {
        console.error('Error during super resolution:', error);
      }
      this.loading=false
    },

    async uploadFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadResponse = await this.doUpload(formData);
        const inputPath = uploadResponse.path;
        this.requestParams.input_path=uploadResponse.path;
        this.originImage=uploadResponse.url;
        console.log(inputPath)
      } catch (error) {
        console.error('Error uploading or processing file:', error);
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click(); // 触发文件输入的点击事件
    },
  }
}
</script>
