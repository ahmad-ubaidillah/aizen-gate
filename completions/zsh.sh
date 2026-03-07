#compdef aizen-gate

_aizen-gate() {
  local line state

  _arguments -C \
    "1: :->cmds" \
    "*::arg:->args"

  case "$state" in
    cmds)
      local -a commands
      commands=(
        "install:Install Aizen-Gate into workspace"
        "start:Begin a new session"
        "status:Check current scrum board"
        "doctor:Run workspace health check"
        "map:Map architectural codebase"
        "docs:Documentation suite"
        "auto:Trigger autonomous implementation"
        "dashboard:Launch live Kanban dashboard"
        "specify:Specify features"
        "research:Run parallel research"
        "plan:Generate technical plan"
        "tasks:Generate WPs from plan"
        "task:Task CLI operations"
        "mcp:Launch MCP Server"
        "ingest:Ingest document to Memory Store"
        "export:Export Kanban board"
        "implement:Manual WP execution"
        "review:QA Review WP"
        "verify:UAT testing"
        "merge:Merge approved branches"
        "quick:Quick fix flow"
        "fix:Bug fix flow"
        "archive:Compress context"
        "benchmark:Audit protocol compliance"
        "pause:Pause session state"
        "resume:Resume session state"
        "tokens:Token efficiency report"
        "kg:Knowledge Graph"
        "skill:Marketplace skills"
        "constitution:Project principles interview"
        "analyze:Cross-artifact consistency"
        "clean:Archive finished WPs"
      )
      _describe -t commands 'aizen-gate command' commands
      ;;
      
    args)
      case $line[1] in
        task)
          local -a subcommands
          subcommands=(
            "create:Create a new task"
            "list:List all tasks"
            "edit:Edit task"
            "search:Fuzzy search tasks"
          )
          if (( CURRENT == 2 )); then
            _describe -t subcommands 'task command' subcommands
          else
             # We could parse backlog/tasks for dynamic task completion here
             _files
          fi
          ;;
        *)
          _files
          ;;
      esac
      ;;
  esac
}

compdef _aizen-gate aizen-gate
