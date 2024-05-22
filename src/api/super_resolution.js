import request from '@/utils/request'

export function performSuperResolution(data) {
  return request({
    url: '/cugan/super-resolution',
    method: 'post',
    data
  })
}

export function super_resolution(data) {
  return request({
    url: '/cugan/super-resolution',
    method: 'post',
    data
  })
}
