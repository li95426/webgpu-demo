const vertex = /* wgsl */ `
@vertex
fn main(@location(0) pos: vec3<f32>) -> @builtin(position) vec4<f32>
{
  var pos2 = vec4<f32>(pos, 1.0);
  // pos2.x -= 0.2; // 所有顶点偏移 0.2
  return pos2; // 返回顶点数据，渲染管线下个环节使用
}
`;

const fragment = /* wgsl */ `
@fragment
fn main() -> @location(0) vec4<f32>
{
  return vec4<f32>(1.0, 0.0, 0.0, 1.0); // 返回颜色值，渲染管线下个环节使用
}
`;

export { vertex, fragment };
