
let local={};
let args={};
let global={};

let delRows=[];

let params={};
let mirror={};
let mirrorParam=false;
let local2={};
let args2={};
let global2={};

let codeToParse=null;
let inputArgs=null;
let parsed=null;

function convert3(_codeToParse,_args,_parsed)
{

    codeToParse=_codeToParse;
    inputArgs=_args;
    parsed=_parsed;

    createMirror();

    prepare();
    body();
    deleteLines();
    addBR();
    return codeToParse;
}


function createMirror()
{
    let map={};
    let map2={};
    let arr=codeToParse.split('\n');
    let flag=false;
    for (let i = 0; i <arr.length ; i++) {
        map[i+1]=flag;
        flag=createMirror2(i,map,flag,arr);
        if (arr[i].includes('}'))
            flag=false;
    }
    for (let i = 0; i <parsed.length; i++) {
        map2[parsed[i][0]]=map[parsed[i][0]];
    }
    mirror= map2;
}
function createMirror2(i,map,flag,arr)
{
    if (arr[i].includes('if')||arr[i].includes('else if')||arr[i].includes('else')||arr[i].includes('while'))
        flag=true;
    return flag;
}
function checkMirror(rowNumber)
{
    if (mirrorParam==true&&mirror[rowNumber]==false)
    {
        local=local2;
        args=args2;
        global=global2;
        mirrorParam=false;
    }
    else if(mirrorParam==false&&mirror[rowNumber]==true)
        checkMirror2();


}
function checkMirror2()
{
    var key;
    for (key in local)
        local2[key]=local[key];
    for (key in args)
        args2[key]=args[key];
    for (key in global)
        global2[key]=global[key];
    mirrorParam=true;
}

function prepare()
{
    let k=seperateNames();
    let v=seperateArgs();
    for (let i = 0; i <k.length ; i++) {
        handlee(k[i],v[i]);
    }
}
function seperateNames()
{
    let arr=[];
    let funcLine=-1;
    for (let i = 0; i < parsed.length; i++) {
        if (funcLine==parsed[i][0])
            arr.push(parsed[i][2]);
        if (parsed[i][1] === 'function declaration')
            funcLine = parsed[i][0];
    }
    return arr;
}
function seperateArgs()
{
    let arr=[];
    let count=0;
    let s='';
    for (let i = 0; i <inputArgs.length ; i++) {
        s=s+inputArgs[i];
        if(inputArgs[i]==='[')
            count++;
        if(inputArgs[i]===']')
            count--;
        s=seperateArgs2(i,s,count,arr);
    }
    if (s!='')
        arr.push(s);
    return arr;
}
function seperateArgs2(i,s,count,arr)
{
    if (inputArgs[i]===','&&count===0)
    {
        s=s.substring(0,s.length-1);
        arr.push(s);
        s='';
    }
    return s;
}
function handlee(k,v)
{
    params[k]=v;
    if(v[0]=='[') {
        v = v.substring(1);
        v = v.substring(0, v.length - 1);
        let arr = v.split(',');
        for (let i = 0; i < arr.length; i++)
        {
            params[k+'['+i+']']=arr[i];
            local[k+'['+i+']']=k+'['+i+']';
        }
    }

}

function body()
{
    let funcLine=-1;
    let type = 'local';
    for (let i = 0; i < parsed.length; i++) {
        if (parsed[i][1] === 'function declaration')
            funcLine = parsed[i][0];

        if (funcLine === -1)
            type = 'global';
        else if (funcLine === parsed[i][0])
            type = 'args';
        else
            type = 'local';

        body2(i,type);

    }
    return codeToParse;
}
function body2(i,type)
{
    checkMirror(parsed[i][0]);

    if (parsed[i][1] === 'variable declaration'||parsed[i][1] === 'assignment expression')
        varDec(parsed[i],type);
    else if (parsed[i][1] === 'return statement')
        returnn(parsed[i]);
    else
        body3(i);

}
function  body3(i)
{
    if (parsed[i][1] === 'while statement' || parsed[i][1] === 'if statement' || parsed[i][1] === 'else if statement')
        condition(parsed[i]);
}
function varDec(row,type)
{
    if(args[row[2]]!=undefined) {
        args[row[2]] = clearify(row[4], false);
        replaceAssignment(row[0],clearify(row[4],false));
    }
    else if(global[row[2]]!=undefined) {
        global[row[2]] = clearify(row[4], false);
        replaceAssignment(row[0], clearify(row[4], false));
    }
    else if(local[row[2]]!=undefined) {
        local[row[2]] = clearify(row[4], false);
        delRows.push(row[0]);
    }
    else
        varDec2(row,type);
}
function varDec2(row,type)
{
    if(type==='global')
    {
        global[row[2]]=''+row[2];
        if(row[4]!=null)
            global[row[2]]=row[4];
    }
    else if(type==='args')
    {
        args[row[2]]=''+row[2];
        //if(row[4]!=null)
        //    args[row[2]]=row[4];
    }
    else {
        local[row[2]]=clearify(row[4],false);
        delRows.push(row[0]);
    }
}
function replaceAssignment(line,what)
{
    let arr=codeToParse.split('\n');
    let pre= arr[line-1].substring(0, arr[line-1].indexOf('=') );
    arr[line-1]=pre+'= '+what+';';

    let ans=arr[0];
    for (let i = 1; i < arr.length; i++)
        ans=ans+'\n'+arr[i];
    codeToParse= ans;
}

function returnn(row)
{
    row[4]=clearify(row[4],false);
    replaceReturn(row[0],row[4]);
}
function replaceReturn(line,what)
{
    let arr=codeToParse.split('\n');
    let pre= arr[line-1].substring(0, arr[line-1].indexOf('r') );
    arr[line-1]=pre+'return '+what+';';

    let ans=arr[0];
    for (let i = 1; i < arr.length; i++)
        ans=ans+'\n'+arr[i];
    codeToParse= ans;
}

function condition(row)
{
    row[3]=clearify(row[3],false);
    row[3]=color(row[3]);
    replaceCondition(row[0],row[3]);
}
function color(condition)
{
    let tmp=local;
    local=params;
    let ans=clearify(condition,true);
    local=tmp;
    if(eval(ans))
        condition='<mark style="background-color: chartreuse" >'+condition+'</mark>';
    else
        condition='<mark style="background-color: red" >'+condition+'</mark>';
    return condition;
}
function replaceCondition(line,what)
{
    let arr=codeToParse.split('\n');
    let post=arr[line-1].substring( arr[line-1].lastIndexOf(')')+1 ) ;
    let pre= arr[line-1].substring(0, arr[line-1].indexOf('(') );
    arr[line-1]=pre+what+post;

    let ans=arr[0];
    for (let i = 1; i < arr.length; i++)
        ans=ans+'\n'+arr[i];
    codeToParse = ans;
}


function clearify(expression,replaceArgs)
{
    expression=expression+'';
    let terms=[];

    clearify2(expression,replaceArgs,terms);
    let s='';
    for (let i = 0; i <terms.length ; i++) {
        s=s+terms[i];
    }
    return s;
}
function clearify2(expression,replaceArgs,terms)
{
    let s='';
    for (let i = 0; i <expression.length ; i++)
    {
        if ('1234567890[_]abcdefghijklmnopqrstuvwxyz'.includes(expression[i]))
            s=s+expression[i];
        else {
            if (s!='') {
                terms.push(switchh(s,replaceArgs));
                s='';
            }
            terms.push(expression[i]);
        }
    }
    if(s!='')
        terms.push(switchh(s,replaceArgs));
}
function switchh(term,replaceArgs)
{
    if (replaceArgs)
        if (params[term]!=undefined)
            return params[term];
    if(args[term]!=undefined)
        return args[term];
    return switchh2(term);
}
function switchh2(term)
{
    if(global[term]!=undefined)
        return global[term];
    if(local[term]!=undefined)
        return local[term];
    return term;
}

function deleteLines()
{
    let arr=codeToParse.split('\n');
    let ans=arr[0];
    for (let i = 1; i < arr.length; i++)
        if (!delRows.includes(i+1))
        {
            ans=ans+'\n'+arr[i];
        }
    codeToParse= ans;
}


function addBR()
{
    let arr=codeToParse.split('\n');
    let ans=arr[0];
    for (let i = 1; i < arr.length; i++)
        ans=ans+'<br>'+arr[i];
    codeToParse= ans;
}

export {convert3};