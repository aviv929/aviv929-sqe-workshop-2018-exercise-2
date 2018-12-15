import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {convert1,convert2} from './parser';
import {convert3} from './subtitute';



$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        //$('#parsedCode').val(JSON.stringify(parsedCode, null, 2));

        //ex1
        let t=convert1(parsedCode);
        let s=convert2(t);
        document.getElementById('t').innerHTML=s;
        //ex2
        let f=convert3(codeToParse,document.getElementById('params').value,t);

        document.getElementById('parsedCode').innerHTML=f+'';
    });
});

