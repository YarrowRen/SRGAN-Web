import { img_detect } from '@/api/ocr';


const getDefaultState = () => {
  return {
    detectionResult: null,
  }
}

const state = getDefaultState()

const mutations = {
  // 设置检测结果
  SET_DETECTION_RESULT(state, result) {
    state.detectionResult = result;
  },
};

const actions = {
  // 执行图片检测
  async detectImage({ commit }, imageData) {
    try {
      const response = await img_detect(imageData);
      commit('SET_DETECTION_RESULT', response.data);
      // console.log(response)
      return response.data;
    } catch (error) {
      console.error('detectImage error:', error);
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
