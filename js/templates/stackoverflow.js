/* Hover classes bound themselves to a node
 */
class StackOverFlowHover {
    constructor(node, CURRENT_TAB) {
        this.boundNode = node;
        this.redirectLink = node.href;
        this.CURRENT_TAB = CURRENT_TAB;
        this.linkType = this.checkLinkType();
    }

    /* Description: This function is unique to every Hover class,
     * its goal is to get how many accepted answer are they .
     * it can also give the code of the accepted answer.
     */
    checkLinkType() {
        if (this.CURRENT_TAB != 'stackoverflow.com' && this.redirectLink.includes('/questions/')) {
 
            return 'stackoverflow';
        } else {
            return 'unknown';
        }
    }

    bindToContainer(node, domain, container) {

    
        if (this.linkType == 'stackoverflow') {
            let question_id = node.href.split('questions/')[1].split('/')[0]
            window
                .survolBackgroundRequest(`https://api.stackexchange.com/2.2/questions/${question_id}/answers?order=desc&sort=activity&site=stackoverflow&filter=!--1nZx.VICx*`)
                .then((res) => {
                    
                    let accepted_answer;
                    let up_vote_cout = []
                    for(var items in res.data.items){
                        if(res.data.items[items].is_accepted){
                            accepted_answer = res.data.items[items];
                            break;
                        }
                        up_vote_cout.push(res.data.items[items].up_vote_count)
                    }
                    up_vote_cout.sort((a,b)=>{return a-b;})
                    if(!accepted_answer){
                        for(var items in res.data.items){
                            if(res.data.items[items].up_vote_count == up_vote_cout[up_vote_cout.length-1]){
                                accepted_answer = res.data.items[items]
                                break;
                            }
                        }
                    }

                    let stackcontainer = document.createElement('div')
                    stackcontainer.className = "survol-wikipedia-container"

                    let webTitle = document.createElement('h1');
                    if(accepted_answer.is_accepted){
                        webTitle.appendChild(document.createTextNode(`1 Answer Accepted !`))
                    }else {
                        webTitle.appendChild(document.createTextNode(`0 Answer Accepted !`))
                    }
                    let code_div = document.createElement('div')
                    code_div.className = "code"

                    let textContainer = document.createElement('div');
                    textContainer.className = 'survol-wikipedia-text';

                    let text = document.createElement('p');
                    if(accepted_answer.body.includes('<p>')){
                        text.insertAdjacentHTML('beforeend',accepted_answer.body.split('<p>')[1].split('</p>')[0].slice(0,200)+'...')
                    }
                    let code = document.createElement('code')
                    if(accepted_answer.body.includes('<pre>')){
                        code.insertAdjacentHTML('beforeend',accepted_answer.body.split('<pre>')[1].split('</pre>')[0])
                    }
                    code_div.appendChild(code)

                    textContainer.appendChild(webTitle);
                    textContainer.appendChild(text);
                    textContainer.appendChild(code_div)
                    
                    stackcontainer.appendChild(textContainer);
                    
                    
                    
                    container.appendChild(stackcontainer);

                   
                })
                .catch(console.error);
        }
    }
}