export default {
  pmhApi: {
    input: {
      target: './swagger-cleaned.json', // Đường dẫn file swagger (đã được làm sạch)
    },
    output: {
      mode: 'tags-split', // Chia nhỏ file sinh ra theo tag của API
      target: 'src/api/generated',
      schemas: 'src/api/types',
      client: 'react-query', // Tự động sinh ra các custom hooks cho react-query
      mock: false,
      override: {
        mutator: {
          path: 'src/api/client/axiosInstance.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
};
