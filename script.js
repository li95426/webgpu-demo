async function init() {
  if (!navigator.gpu) {
    throw new Error("WebGPU not supported on this browser.");
  }
  // 请求 gpu 适配器
  const adapter = await navigator.gpu.requestAdapter();
  // gpu 设备对象
  const device = await adapter.requestDevice();
  console.log("adapter", adapter);
  console.log("device", device);

  const canvas = document.querySelector("#gpuCanvas");
  const context = canvas.getContext("webgpu");
  // 颜色格式
  const format = navigator.gpu.getPreferredCanvasFormat();
  console.log("format", format);
  context.configure({
    device: device,
    format: format,
    alphaMode: "premultiplied",
  });
  // 创建顶点缓冲区表示顶点数据
  const vertexArray = new Float32Array([
    0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0,
  ]);
  console.log("vertexArray", vertexArray);
  console.log("vertexArray.byteLength", vertexArray.byteLength);
  console.log("GPUBufferUsage.VERTEX", GPUBufferUsage.VERTEX);
  console.log("GPUBufferUsage.COPY_DST", GPUBufferUsage.COPY_DST);
  // 创建一个顶点缓冲区，用来存放顶点数据
  const vertexBuffer = device.createBuffer({
    size: vertexArray.byteLength, // 缓冲区的字节长度
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, // 用途
  });
  // 把 vertexArray 数据写入到 vertexBuffer 中
  device.queue.writeBuffer(vertexBuffer, 0, vertexArray);

  const pipeline = device.createRenderPipeline({
    vertex: {
      // 顶点相关配置
      buffers: [
        // 顶点所有缓冲区模块设置
        {
          //其中一个顶点缓冲区设置
          arrayStride: 3 * 4, // 一个顶点数据占用的字节长度
          attributes: [
            // 顶点缓冲区属性
            {
              shaderLocation: 0, // GPU 现存上顶点缓冲区标记储存位置
              format: "float32x3", // 格式：loat32x3表示一个顶点数据包含 3 个
              offset: 0, // arrayStride 表示每组顶点数据间隔字节数
            },
          ],
        },
      ],
    },
  });
}

init();
