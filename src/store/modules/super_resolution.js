import { performSuperResolution } from '@/api/super_resolution';
import { uploadFile } from '@/api/user'; // 确保路径正确

const getDefaultState = () => {
  return {
    superResolutionResult: null,
    uploadResult: null,
  }
}

const state = getDefaultState()

const mutations = {
  // 设置超分辨率处理结果
  SET_SUPER_RESOLUTION_RESULT(state, result) {
    state.superResolutionResult = result;
  },
  // 设置文件上传结果
  SET_UPLOAD_RESULT(state, result) {
    state.uploadResult = result;
  },
};

const actions = {
  // 执行超分辨率处理
  async doSuperResolution({ commit }, requestData) {
    try {
      const response = await performSuperResolution(requestData);
      // commit('SET_SUPER_RESOLUTION_RESULT', response.data);
      // 可以在这里添加更多的逻辑，例如处理响应数据
      return response.data;
    } catch (error) {
      console.error('doSuperResolution error:', error);
      throw error;
    }
  },

  // 执行文件上传
  async doUpload({ commit }, fileData) {
    try {
      const response = await uploadFile(fileData);
      // commit('SET_UPLOAD_RESULT', response.data);
      // 可以在这里添加更多的逻辑，例如处理响应数据
      return response.data;
    } catch (error) {
      console.error('doUpload error:', error);
      throw error;
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
