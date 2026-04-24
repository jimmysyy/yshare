#!/usr/bin/env python3
"""
Build script to embed data.json into index.html
用法: python3 build.py
"""

import json
import os

def build():
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 文件路径
    data_file = os.path.join(script_dir, 'assets', 'data.json')
    template_file = os.path.join(script_dir, 'template.html')
    output_file = os.path.join(script_dir, 'index.html')
    
    # 检查文件是否存在
    if not os.path.exists(data_file):
        print(f"❌ 错误: 找不到 {data_file}")
        return False
    
    if not os.path.exists(template_file):
        print(f"❌ 错误: 找不到 {template_file}")
        return False
    
    try:
        # 读取 JSON 数据
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 读取 HTML 模板
        with open(template_file, 'r', encoding='utf-8') as f:
            template = f.read()
        
        # 将 JSON 数据格式化成 JavaScript 对象字符串
        # 使用 indent=2 保持可读性
        data_json = json.dumps(data, ensure_ascii=False, indent=2)
        
        # 替换占位符
        html_content = template.replace('{{DATA_PLACEHOLDER}}', data_json)
        
        # 写入 index.html
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✅ 成功! 已生成 index.html")
        print(f"📊 数据来源: {data_file}")
        print(f"📄 模板来源: {template_file}")
        print(f"🎯 输出文件: {output_file}")
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ 错误: data.json 格式不正确")
        print(f"   {e}")
        return False
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

if __name__ == '__main__':
    success = build()
    exit(0 if success else 1)
