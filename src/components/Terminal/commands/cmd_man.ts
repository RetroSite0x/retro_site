import type { CommandHandler } from '../../../types/terminal';

const PAGES: Record<string, string> = {
  ls: `LS(1)                    User Commands                    LS(1)

NAME
    ls - list directory contents

SYNOPSIS
    ls [OPTION]... [FILE]...

DESCRIPTION
    List information about files and directories.

    -a      Include hidden files
    -l      Long format (not implemented)

EXAMPLES
    ls          List current directory
    ls /home    List /home directory
    ls -a       Include hidden files`,

  cd: `CD(1)                    User Commands                    CD(1)

NAME
    cd - change the current directory

SYNOPSIS
    cd [DIRECTORY]

DESCRIPTION
    Change the current working directory to the specified directory.

    If no directory is given, change to the home directory (/home/guest).

EXAMPLES
    cd /projects    Change to /projects
    cd ..           Go up one directory
    cd ~            Go to home directory`,

  cat: `CAT(1)                    User Commands                    CAT(1)

NAME
    cat - concatenate and display files

SYNOPSIS
    cat [FILE]...

DESCRIPTION
    Display the contents of one or more files on the terminal.

EXAMPLES
    cat /home/guest/about.txt    Display about information
    cat /projects/automlbench/README.md    Display project readme`,

  pwd: `PWD(1)                    User Commands                    PWD(1)

NAME
    pwd - print name of current/working directory

SYNOPSIS
    pwd

DESCRIPTION
    Print the absolute pathname of the current working directory.`,

  clear: `CLEAR(1)                    User Commands                    CLEAR(1)

NAME
    clear - clear the terminal screen

SYNOPSIS
    clear

DESCRIPTION
    Clear the terminal screen by removing all previous output.`,

  echo: `ECHO(1)                    User Commands                    ECHO(1)

NAME
    echo - display a line of text

SYNOPSIS
    echo [STRING]...

DESCRIPTION
    Display the given strings on the terminal followed by a newline.

EXAMPLES
    echo Hello World    Prints "Hello World"
    echo $PATH          Prints the PATH variable`,

  help: `HELP(1)                    User Commands                    HELP(1)

NAME
    help - display help information

SYNOPSIS
    help

DESCRIPTION
    Display a list of all available commands with brief descriptions.`,

  sysinfo: `SYSINFO(1)                    User Commands                    SYSINFO(1)

NAME
    sysinfo - display system information

SYNOPSIS
    sysinfo

DESCRIPTION
    Display system and user profile information including
    name, occupation, skills, and status.`,

  grep: `GREP(1)                    User Commands                    GREP(1)

NAME
    grep - search file contents for patterns

SYNOPSIS
    grep [PATTERN] [FILE]...

DESCRIPTION
    Search for PATTERN in each FILE. PATTERN is a regular expression.

EXAMPLES
    grep "NLP" /home/guest/resume.txt    Find lines containing NLP
    grep -i "error" /logs/2024.log       Case-insensitive search`,

  theme: `THEME(1)                    User Commands                    THEME(1)

NAME
    theme - change the terminal color theme

SYNOPSIS
    theme [THEME]

DESCRIPTION
    Switch between available phosphor color themes:
    green, amber, white, blue

    With no argument, display the current theme.

EXAMPLES
    theme amber    Switch to amber theme
    theme green    Switch to green theme`,

  about: `ABOUT(1)                    User Commands                    ABOUT(1)

NAME
    about - display user profile information

SYNOPSIS
    about

DESCRIPTION
    Display a formatted box with personal and professional
    information about Ann Naser Nabil.`,

  projects: `PROJECTS(1)                    User Commands                    PROJECTS(1)

NAME
    projects - list portfolio projects

SYNOPSIS
    projects

DESCRIPTION
    List all software projects with their status and descriptions.`,

  research: `RESEARCH(1)                    User Commands                    RESEARCH(1)

NAME
    research - display research interests

SYNOPSIS
    research

DESCRIPTION
    Show current research interests and ongoing projects
    in NLP and computational social science.`,

  papers: `PAPERS(1)                    User Commands                    PAPERS(1)

NAME
    papers - list academic publications

SYNOPSIS
    papers

DESCRIPTION
    List all published papers and academic works.`,

  datasets: `DATASETS(1)                    User Commands                    DATASETS(1)

NAME
    datasets - list published datasets

SYNOPSIS
    datasets

DESCRIPTION
    List all publicly available datasets published on
    HuggingFace and other platforms.`,

  experience: `EXPERIENCE(1)                    User Commands                    EXPERIENCE(1)

NAME
    experience - show work experience

SYNOPSIS
    experience

DESCRIPTION
    Display professional work history and positions held.`,

  skills: `SKILLS(1)                    User Commands                    SKILLS(1)

NAME
    skills - list technical skills

SYNOPSIS
    skills

DESCRIPTION
    List technical skills categorized by domain.`,

  timeline: `TIMELINE(1)                    User Commands                    TIMELINE(1)

NAME
    timeline - show career timeline

SYNOPSIS
    timeline

DESCRIPTION
    Display a chronological timeline of career events.`,

  resume: `RESUME(1)                    User Commands                    RESUME(1)

NAME
    resume - display resume

SYNOPSIS
    resume

DESCRIPTION
    Read and display the resume file from the virtual filesystem.`,

  github: `GITHUB(1)                    User Commands                    GITHUB(1)

NAME
    github - show GitHub profile info

SYNOPSIS
    github [--open|-o]

DESCRIPTION
    Display GitHub profile URL and featured repositories.
    Use --open or -o to open the profile in a browser.`,

  linkedin: `LINKEDIN(1)                    User Commands                    LINKEDIN(1)

NAME
    linkedin - show LinkedIn profile info

SYNOPSIS
    linkedin [--open|-o]

DESCRIPTION
    Display LinkedIn profile URL.
    Use --open or -o to open the profile in a browser.`,

  contact: `CONTACT(1)                    User Commands                    CONTACT(1)

NAME
    contact - display contact information

SYNOPSIS
    contact

DESCRIPTION
    Display all contact and social media information.`,

  blog: `BLOG(1)                    User Commands                    BLOG(1)

NAME
    blog - list blog posts

SYNOPSIS
    blog

DESCRIPTION
    List available blog posts and their descriptions.`,

  tree: `TREE(1)                    User Commands                    TREE(1)

NAME
    tree - display directory tree

SYNOPSIS
    tree [DIRECTORY]

DESCRIPTION
    Display the directory structure as a tree using
    ASCII box-drawing characters.

EXAMPLES
    tree              Show current directory tree
    tree /projects    Show projects directory tree`,

  man: `MAN(1)                    User Commands                    MAN(1)

NAME
    man - display manual pages for commands

SYNOPSIS
    man [COMMAND]

DESCRIPTION
    Display the manual page for the specified command.
    If no command is given, show this help message.`,

  uptime: `UPTIME(1)                    User Commands                    UPTIME(1)

NAME
    uptime - show how long the system has been running

SYNOPSIS
    uptime

DESCRIPTION
    Display the current time, system uptime, number of users,
    and load averages.`,

  hostname: `HOSTNAME(1)                    User Commands                    HOSTNAME(1)

NAME
    hostname - show or set the system hostname

SYNOPSIS
    hostname [--ip]

DESCRIPTION
    Display the system hostname.
    Use --ip to show the network IP address.`,

  neofetch: `NEOFETCH(1)                    User Commands                    NEOFETCH(1)

NAME
    neofetch - display system information with ASCII art

SYNOPSIS
    neofetch

DESCRIPTION
    Display system information in a neofetch-style format
    with ASCII art and system details.`,

  fortune: `FORTUNE(1)                    User Commands                    FORTUNE(1)

NAME
    fortune - display a random fortune

SYNOPSIS
    fortune

DESCRIPTION
    Display a random inspirational or humorous quote.`,

  cowsay: `COWSAY(1)                    User Commands                    COWSAY(1)

NAME
    cowsay - display a cow saying something

SYNOPSIS
    cowsay [MESSAGE]

DESCRIPTION
    Display an ASCII art cow saying the given message.
    If no message is given, the cow says "moo".`,

  matrix: `MATRIX(1)                    User Commands                    MATRIX(1)

NAME
    matrix - display the Matrix rain effect

SYNOPSIS
    matrix

DESCRIPTION
    Display a Matrix-style digital rain animation effect.
    Runs for approximately 3 seconds.`,

  htop: `HTOP(1)                    User Commands                    HTOP(1)

NAME
    htop - interactive process viewer

SYNOPSIS
    htop

DESCRIPTION
    Display a simulated process viewer similar to htop.`,

  top: `TOP(1)                    User Commands                    TOP(1)

NAME
    top - display running processes

SYNOPSIS
    top

DESCRIPTION
    Display a simulated list of running processes.`,

  ping: `PING(1)                    User Commands                    PING(1)

NAME
    ping - send ICMP echo requests

SYNOPSIS
    ping [HOST]

DESCRIPTION
    Send simulated ICMP echo requests to a host.
    No actual network activity occurs.`,

  curl: `CURL(1)                    User Commands                    CURL(1)

NAME
    curl - transfer data from URLs

SYNOPSIS
    curl [URL]

DESCRIPTION
    Simulate fetching data from URLs.
    No actual network activity occurs.`,

  weather: `WEATHER(1)                    User Commands                    WEATHER(1)

NAME
    weather - display weather information

SYNOPSIS
    weather

DESCRIPTION
    Display current weather for Dhaka, Bangladesh.
    Uses simulated data.`,
};

export const cmd_man: CommandHandler = (args) => {
  if (args.length === 0) {
    return {
      type: 'output',
      content: `What manual page do you want?
For example: man ls`,
    };
  }

  const page = PAGES[args[0].toLowerCase()];

  if (!page) {
    return {
      type: 'error',
      content: `No manual page for '${args[0]}'`,
    };
  }

  return { type: 'output', content: page };
};
