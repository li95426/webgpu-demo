import { vertex, fragment } from "./shader.js";
async function init() {
  if (!navigator.gpu) {
    throw new Error("WebGPU not supported on this browser.");
  }
  // 请求 gpu 适配器
  const adapter = await navigator.gpu.requestAdapter();
  // gpu 设备对象
  const device = await adapter.requestDevice();

  const canvas = document.querySelector("#gpuCanvas");
  const context = canvas.getContext("webgpu");
  // 颜色格式
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device: device,
    format: format,
    alphaMode: "premultiplied",
  });
  // 创建顶点缓冲区表示顶点数据
  const vertexArray = new Float32Array([
    0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0,
  ]);
  // 创建一个顶点缓冲区，用来存放顶点数据
  const vertexBuffer = device.createBuffer({
    size: vertexArray.byteLength, // 缓冲区的字节长度
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, // 用途
  });
  // 把 vertexArray 数据写入到 vertexBuffer 中
  device.queue.writeBuffer(vertexBuffer, 0, vertexArray);

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    // 顶点着色器代码
    vertex: {
      module: device.createShaderModule({
        code: vertex,
      }),
      entryPoint: "main",
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
    fragment: {
      // 片元着色器代码
      module: device.createShaderModule({
        code: fragment,
      }),
      entryPoint: "main",
      targets: [
        {
          format: format, // 和 WebGL 上下文的格式对应
        },
      ],
    },
    primitive: {
      // 绘制三角形、线条、点等
      topology: "triangle-list",
    },
  });
  // 创建一个 GPU 命令编码器对象，用来控制渲染管线 pipeline 渲染输出像素数据
  const commandEncoder = device.createCommandEncoder();
  const renderPass = commandEncoder.beginRenderPass({
    // 颜色附件
    // 给渲染通道制定颜色缓冲区，配置指定的缓冲区
    colorAttachments: [
      {
        // 指向用于 Canvas 画布的纹理视图对象（Canvas 对应的颜色缓冲区）
        // 该渲染通道 renderPass 输出的像素数据会写入到 Canvas 画布的纹理视图对象中
        view: context.getCurrentTexture().createView(),
        storeOp: "store", // 输出的像素数据写入到纹理视图对象中
        loadOp: "clear", // 清空纹理视图对象
        clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
      },
    ],
  });
  renderPass.setPipeline(pipeline);
  // 绑定顶点缓冲区
  renderPass.setVertexBuffer(0, vertexBuffer);
  // 绘制
  renderPass.draw(3);
  renderPass.end();
  // 提交命令， 创建命令缓冲区（生成 GPU 指令存入缓冲区）
  const commandBuffer = commandEncoder.finish();
  // 命令编码器缓冲区中命令传入GPU设备
  device.queue.submit([commandBuffer]);
}

init();
