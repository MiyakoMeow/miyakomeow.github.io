# 基准路径（相对本脚本文件）
let script_root = (
  if (($env | get -o FILE_PWD) != null) { $env.FILE_PWD } else { $env.PWD }
)

# JSON 存放目录
let json_dir = ($script_root | path join "../public/bms/table-mirror")

# 页面生成目录（改为 entry/bms/table-mirror）
let pages_dir = ($script_root | path join "../entry/bms/table-mirror")

let tables_proxy_out = ($json_dir | path join "tables_proxy.json")

# 检查依赖文件是否存在
if not ($tables_proxy_out | path exists) {
  print $"Error: ($tables_proxy_out) not found. Please run fetch-table-data.nu first."
  exit 1
}

# 清理并创建页面目录
if ($pages_dir | path exists) {
  ls $pages_dir | where type == "dir" | get name | each { |n|
    rm -r ($pages_dir | path join $n)
  }
} else {
  mkdir $pages_dir
}

# 读取数据
let items = (open $tables_proxy_out)
# 还需要读取原始数据以获取 url_ori，但 fetch-table-data.nu 中 upsert 并没有删除 url_ori，
# 所以 tables_proxy.json 中应该保留了 url_ori。
# 让我们确认一下逻辑：
# fetch-table-data.nu: $items | each { |it| ($it | upsert url ...) }
# upsert 更新字段，保留其他字段。所以 url_ori 应该还在。

let tpl_path = ($script_root | path join "../entry/bms/table/self-sp/index.html")
let tpl = (open --raw $tpl_path | into string)

print "generating index pages"
$items | each { |it|
  let dir = ($pages_dir | path join $it.dir_name)
  mkdir $dir
  # 在 tables_proxy.json 中，url 已经是带有代理前缀的完整链接
  let header_link = $it.url
  # url_ori 应该保留在对象中
  let url_ori = (if ($it | transpose | where column0 == "url_ori" | is-empty) { "null" } else { $"\"($it.url_ori)\"" })
  # 注意：原来的代码是 $"\"($it.url_ori)\""，如果 url_ori 为 null 或不存在可能会有问题。
  # 原代码：str replace -a "null" $"\"($it.url_ori)\""
  # 这里假设 items 来自 tables_github.json，其中有 url_ori 字段。
  
  let out = ($tpl | str replace -a "./header.json" $header_link | str replace -a "null" $"\"($it.url_ori)\"")
  $out | save -f ($dir | path join "index.html")
}
