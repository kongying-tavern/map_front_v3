const routes = [{
    path: '/',
    component: () => import('pages/construction_page.vue'),
  },
  {
    path: '/index',
    component: () => import('pages/IndexPage.vue')
  }
]

export default routes
