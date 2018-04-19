var node_color = "#DFBE62";
var stroke_color = "#DFA862";
var recopy_color = "#DF8562";
var suces_color = "#C2DF62";

/*----------------persistant queue algorithm------------------*/

function PStack(prev, el) 
{
	this._Previous = prev;
	this._Value = el;
	this.Count = prev ? prev.Count + 1 : 0;

	this.Push = function(el) 
	{
		return new PStack(this, el);
	}
	this.Peek = function() 
	{
		return this._Value;
	}
	this.Pop = function() 
	{
		return this._Previous;
	}
}

function PQueue(newL, newLi, newR, newRi, newS, 
				 newRecopy, newToCopy, newCopied, newSwapped) 
{	
	this.L = newL   || new PStack();
	this.Li = newLi || new PStack();
	this.R = newR   || new PStack();
	this.Ri = newRi || new PStack();
	this.S = newS   || new PStack();
	
	this.recopy = newRecopy || false;
	this.toCopy = newToCopy || 0;
	this.copied = newCopied || false;
	this.swapped = newSwapped || false;

	this.IsEmpty = function()
	{
	    return !this.recopy && this.R.Count == 0;
	}
	this.Push = function(element) 
	{
		if (!this.recopy) 
		{
		    var Ln = this.L.Push(element);

		    queue_to_visualization.push({
		        operation: "Push",
		        stack: Ln,
		        element: element,
		        stackName: "Left"
		    });

		    var Q = new PQueue(Ln, this.Li, this.R, this.Ri, this.S, this.recopy, this.toCopy, this.copied, this.swapped);
			return Q.CheckRecopy();
        } 
		else 
		{
		    var Lni = this.Li.Push(element);

		    queue_to_visualization.push({
		        operation: "Push",
		        stack: Lni,
		        element: element,
		        stackName: "LeftCopy"
		    });

		    var Q = new PQueue(this.L, Lni, this.R, this.Ri, this.S, this.recopy, this.toCopy, this.copied, this.swapped);
			return Q.CheckNormal();
        }
	}
	this.Pop = function() 
	{
		if (!this.recopy) 
		{
		    var Rn = this.R.Pop();

		    queue_to_visualization.push({
		        operation: "Pop",
		        stack: this.R,
		        stackName: "Right"
		    });

		    var Q = new PQueue(this.L, this.Li, Rn, this.Ri, this.S, this.recopy, this.toCopy, this.copied, this.swapped);
			return Q.CheckRecopy();
        } 
		else 
		{
		    queue_to_visualization.push({
		        operation: "Pop",
		        stack: this.Ri,
		        stackName: "RightCopy"
		    });

		    var Rni = this.Ri.Pop();
			var Rn = this.R;
			var curCopy = this.toCopy;
			if (this.toCopy > 0) 
			{
			    --curCopy;

			    queue_to_visualization.push({
			        operation: "Set",
			        variableValue: curCopy,
			        variableName: "ToCopy",
			        oldValue: this.toCopy
			    });
			} 
			else 
			{
			    queue_to_visualization.push({
			        operation: "Pop",
			        stack: this.R,
			        stackName: "Right"
			    });

			    Rn = Rn.Pop();
			}
			var Q = new PQueue(this.L, this.Li, Rn, Rni, this.S, this.recopy, curCopy, this.copied, this.swapped);
			return Q.CheckNormal();
        }
	}
	this.Peek = function() 
	{
		if (!this.recopy) 
		{
            return this.R.Peek();
        } 
		else 
		{
            return this.Ri.Peek();
        }
	}
	this.CheckRecopy = function() 
	{
		if (this.L.Count > this.R.Count) 
		{
            queue_to_visualization.push({
                operation: "Assign",
                stackFrom: this.Ri,
                stackTo: this.R
            });

            queue_to_visualization.push({
                operation: "Set",
                variableValue: this.R.Count,
                variableName: "ToCopy",
                oldValue: 0
            });

            var Q = new PQueue(this.L, this.Li, this.R, this.R, this.S, true, this.R.Count, false, this.swapped);

            queue_to_visualization.push({
                operation: "Set",
                variableValue: true,
                variableName: "Recopy",
                queue: Q,
                oldValue: false
            });

            return Q.CheckNormal();
        } 
		else 
		{
            return new PQueue(this.L, this.Li, this.R, this.Ri, this.S, false, this.toCopy, this.copied, this.swapped);
        }
	}
	this.CheckNormal = function() 
	{
	    var Q = this.AdditionalsOperations();

	    if (Q.S.Count == 0) {
	        queue_to_visualization.push({
	            operation: "Set",
	            variableValue: false,
	            variableName: "Recopy",
	            queue: Q,
	            oldValue: true
	        });
	    }

	    return new PQueue(Q.L, Q.Li, Q.R, Q.Ri, Q.S, Q.S.Count != 0, Q.toCopy, Q.copied, Q.swapped);
	}
	this.AdditionalsOperations = function() 
	{
		var toDo = 3;

		queue_to_visualization.push({
		    operation: "Set",
		    variableValue: toDo,
		    variableName: "ToDo"
		});

        var Ln = this.L;
        var Lni = this.Li;
        var Rn = this.R;
        var Sn = this.S;

        var curCopied = this.copied;
        var curCopy = this.toCopy;
        var curSwapped = this.swapped;

        while (!curCopied && toDo > 0 && Rn.Count > 0) 
        {
            var visRn = Rn;

            var x = Rn.Peek();
            Rn = Rn.Pop();
            Sn = Sn.Push(x);
            --toDo;

            queue_to_visualization.push({
                operation: "RePut",
                stackFrom: visRn,
                stackTo: Sn,
                stackFromName: "Right",
                stackToName: "Temp"
            });
            queue_to_visualization.push({
                operation: "Set",
                variableValue: toDo,
                variableName: "ToDo"
            });
        }

        while (toDo > 0 && Ln.Count > 0) 
        {
            var visLn = Ln;

            curCopied = true;
            var x = Ln.Peek();
            Ln = Ln.Pop();
            Rn = Rn.Push(x);
            --toDo;

            queue_to_visualization.push({
                operation: "RePut",
                stackFrom: visLn,
                stackTo: Rn,
                stackFromName: "Left",
                stackToName: "Right"
            });
            queue_to_visualization.push({
                operation: "Set",
                variableValue: toDo,
                variableName: "ToDo"
            });
        }

        while (toDo > 0 && Sn.Count > 0) 
        {
            var visSn = Sn,
                visCopy = curCopy;

            var x = Sn.Peek();
            Sn = Sn.Pop();
            if (curCopy > 0) 
			{
                Rn = Rn.Push(x);
                --curCopy;
            }
            --toDo;

            if (visCopy > 0) {
                queue_to_visualization.push({
                    operation: "RePut",
                    stackFrom: visSn,
                    stackTo: Rn,
                    stackFromName: "Temp",
                    stackToName: "Right"
                });

                queue_to_visualization.push({
                    operation: "Set",
                    variableValue: visCopy - 1,
                    variableName: "ToCopy",
                    oldValue: visCopy
                });
            }
            else {
                queue_to_visualization.push({
                    operation: "Pop",
                    stack: visSn,
                    stackName: "Temp"
                });
            }
            queue_to_visualization.push({
                operation: "Set",
                variableValue: toDo,
                variableName: "ToDo"
            });
        }

        if (Sn.Count == 0) 
		{
            var t = Ln;
            Ln = Lni;
            Lni = t;

            curSwapped = !curSwapped;

            queue_to_visualization.push({
                operation: "Swap"
            });
        }

        return new PQueue(Ln, Lni, Rn, this.Ri, Sn, this.recopy, curCopy, curCopied, curSwapped);
	}
}

/*--------------persistent queue d3js-------------------*/

var w = window.innerWidth
	|| document.documentElement.clientWidth
	|| document.body.clientWidth;

var h = window.innerHeight
	|| document.documentElement.clientHeight
	|| document.body.clientHeight;

var width = w - 30,
	height = h - 30;

var _curNodeID = -1,
    _curLinkID = -1,
    _rightPathId = -1,
	duration = 750,
    pause = 0,
	root;

var tree = d3.layout.tree()
	.size([width, height]);

var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.x, d.y]; });

var svg = d3.select("#queue-container").append("svg")
	.attr("height", height)
	.attr("width", width)
	.append("g")
	.attr("transform", "translate(" + 0 + "," + 50 + ")");;

root = {};
root.x0 = width / 2;
root.y0 = 0;	

update(root);

var leftRoot = addNode(root, "Left", true);
var leftRecopyRoot = addNode(root, "LeftCopy", true);
var rightRoot = addNode(root, "Right", true);
var rightRecopyRoot = addNode(root, "RightCopy", true);
var bufferRoot = addNode(root, "Temp", true);

var rightSource = rightRecopyRoot,
    rightTarget = rightRecopyRoot;

svg.insert("path", "g")
	.attr("class", "r_link")
	.attr("id", "r_link_" + ++_rightPathId);

d3.select("#node_5").select("circle").style("stroke", stroke_color);

function update(source) {

	// Compute the new tree layout.
	var nodes = tree.nodes(root).reverse(),
		links = tree.links(nodes);

	// Normalize for fixed-depth.
	nodes.forEach(function(d) { d.y = d.depth * 80; });

	// Update the nodes…
	var node = svg.selectAll("g.node")
		.data(nodes, function (d) { return d.id || (d.id = ++_curNodeID); });

	// Enter any new nodes at the parent's previous position.
	var nodeEnter = node.enter().append("g")
		.attr("class", "node")
		.attr("id", "node_" + _curNodeID)
		.attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; });

	nodeEnter.append("circle")
		.attr("r", 1e-6)
		.style("fill", function(d) { return d.isRoot? "#ddd" : "#fff" });

	nodeEnter.append("text")
		.attr("y", function(d) { return d.isRoot? -30 : 0 ;})
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.text(function(d) { return d.name; })
		.style("fill-opacity", 1e-6)
	  	.style("font-weight", function(d) { return d.isRoot? "bold" : "";});

	// Transition nodes to their new position.
	var nodeUpdate = node.transition()
		.duration(duration)
        .delay(pause)
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	nodeUpdate.select("circle")
		.attr("r", 15);

	nodeUpdate.select("text")
		.style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
	var nodeExit = node.exit()
        .transition()
        .duration(duration)
        .delay(pause)
        .attr("transform", function (d) { return "translate(" + source.x + "," + source.y + ")"; })
        .remove();

	nodeExit.select("circle")
        .attr("r", 1e-6);

	nodeExit.select("text")
        .style("fill-opacity", 1e-6);

	// Update the links…
	var link = svg.selectAll("path.link")
		.data(links, function(d) { return d.target.id; });

	// Enter any new links at the parent's previous position.
	link.enter().insert("path", "g")
		.attr("class", "link")
		.attr("id", function (d) { return "link_" + d.target.id; })
		.attr("d", function(d) {
			var o = {x: source.x0, y: source.y0};
			return diagonal({source: o, target: o});
		});

	// Transition links to their new position.
	link.transition()
	 	.duration(duration)
        .delay(pause)
		.attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit()
        .transition()
        .duration(duration)
        .delay(pause)
        .attr("d", function (d) {
            var o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
        })
        .remove();

	svg.selectAll("path.r_link")
        .transition()
        .duration(duration)
        .delay(pause)
	    .attr("d", function (d) {
	        var s = { x: rightSource.x, y: rightSource.y };
	        var t = { x: rightTarget.x, y: rightTarget.y };
	        return diagonal({ source: s, target: t });
	    });

	// Stash the old positions for transition.
	nodes.forEach(function(d) {
		d.x0 = d.x;
		d.y0 = d.y;
	});
}

function addNode(current_node, name, isRoot) {
	var myJSONObject = {"name": name,"children": [], "isRoot": isRoot}; 

	if(current_node.children!=null)
	{
		current_node.children.push(myJSONObject);
	}
	else
	{
		current_node.children=[];
		current_node.children.push(myJSONObject);
	}

	update(current_node);
		
	return myJSONObject;
}

/*--------------persistent queue visualization-------------------*/

var queue_to_visualization = [];
var step_position = 0;

function visualPush(element, toStack, stackName, doNotWrite)
{
    var name = (typeof (element) == "string" ? element : element.name);

    if (!doNotWrite) {
        writeOperation('Pushed element "' + name + '" to ' + stackName);
    }

    var newelement = addNode(toStack._Previous._Value, name, false);
    toStack._Value = newelement;

    pause += duration;

    hiliteNode(toStack._Previous._Value.id, toStack._Previous._Value.isRoot ? "#ddd" : "#fff", false);
    hiliteLink(newelement.id, node_color);
    hiliteNode(newelement.id, node_color, false);
}

function visualBackPush(toStack)
{
    hiliteNode(toStack._Value.id, toStack._Value.isRoot ? "#ddd" : "#fff", false);
    hiliteLink(toStack._Value.id, node_color);
    hiliteNode(toStack._Previous._Value.id, node_color, false);

    var childs = toStack._Previous.Peek().children;
    var max_id = 0, i_of_max;
    for (var i = 0; i < childs.length; ++i)
    {
        if (childs[i].id  && childs[i].id > max_id)
        {
            max_id = childs[i].id;
            i_of_max = i;
        }
    }
    childs.splice(i_of_max, 1);
    toStack._Previous.Peek().children = childs;

    update(toStack._Previous.Peek());
    pause += duration;
}

function visualPop(stack, stackName, doNotWrite)
{
    if (!doNotWrite) {
        writeOperation('Pop element "' + stack.Peek().name + '" from ' + stackName);
    }

    if (stackName != "RightCopy")
    {
        hiliteNode(stack.Peek().id, stack.Peek().isRoot ? "#ddd" : "#fff", false);
        hiliteLink(stack.Peek().id, node_color);
        hiliteNode(stack._Previous.Peek().id, node_color, false);
    }
    else
    {
        copyToRightRecopy(stack._Previous.Peek(), stack.Peek());
    }
}

function visualBackPop(stack, stackName)
{
    if (stackName != "RightCopy")
    {
        hiliteNode(stack._Previous.Peek().id, stack._Previous.Peek().isRoot ? "#ddd" : "#fff", false);
        hiliteLink(stack.Peek().id, node_color);
        hiliteNode(stack.Peek().id, node_color, false);
    }
    else
    {
        copyToRightRecopy(stack.Peek(), stack._Previous.Peek());
    }
}

function setVisual(varValue, varName, queue)
{
    if (varName == "ToDo")
    {
        writeOperation("ToDo changed to " + varValue);
    }
    else if (varName == "ToCopy")
    {
        writeOperation("ToCopy changed to " + varValue);
        setToCopy(varValue);
    }
    else if (varName == "Recopy")
    {
        setRecopy(varValue, queue, true);
    }
}

function visualSetBack(varValue, oldValue, varName, queue)
{
    if (varName == "ToDo") {
    }
    else if (varName == "ToCopy")
    {
        setToCopy(oldValue);
    }
    else if (varName == "Recopy")
    {
        setRecopy(oldValue, queue, true, true);
    }
}

function assignVisual(stackFrom, stackTo)
{
    writeOperation("RigtCopy is references to Right");
    copyToRightRecopy(stackTo.Peek(), stackFrom.Peek());
}

function visualAssignBack(stackFrom, stackTo)
{
    copyToRightRecopy(stackFrom.Peek(), stackTo.Peek());
}

function swapVisual(swapIndex)
{
    writeOperation("Left and LeftCopy was swapped.");
    swapLNames(swapIndex);
}

function visualSwapBack(swapIndex)
{
    swapLNames(swapIndex);
}

function rePutVisual(stackFrom, stackTo, stackFromName, stackToName)
{
    writeOperation("\"" + stackFrom.Peek().name + "\" was shifted from " + stackFromName + " to " + stackToName);
    visualPop(stackFrom, stackFromName, true);
    visualPush(stackFrom.Peek(), stackTo, stackToName, true);
}

function visualRePutBack(stackFrom, stackTo, stackFromName)
{
    visualBackPush(stackTo);
    visualBackPop(stackFrom, stackFromName);
}

function endVisual(massage)
{
    writeOperationEnd(massage);
}

function copyToRightRecopy(newTarget, oldTarget)
{
    svg.selectAll("path.r_link")
        .transition()
        .duration(duration)
        .delay(pause)
	    .attr("d", function (d) {
	        var s = { x: rightSource.x, y: rightSource.y };
	        var t = { x: newTarget.x, y: newTarget.y };
	        return diagonal({ source: s, target: t });
	    });

    d3.select("#node_" + oldTarget.id).select("circle").
                    transition().
                    duration(duration / 2).
                    delay(pause).
                    style("stroke", "#ccc");

    d3.select("#node_" + newTarget.id).select("circle").
                transition().
                duration(duration / 2).
                delay(pause + duration / 2).
                style("stroke", stroke_color);

    rightTarget = newTarget;

    pause += duration;
}

function swapLNames()
{
    swapNamesVisual();
}

function swapNamesVisual() {
    d3.select("#node_2 text")
        .transition()
        .duration(duration / 2)
        .delay(pause)
        .style("fill-opacity", 0);
    d3.select("#node_3 text")
            .transition()
            .duration(duration / 2)
            .delay(pause)
            .style("fill-opacity", 0);
    pause += duration / 2;
    setTimeout(function () {
        var tmp = $("#node_2 text").text();
        $("#node_2 text").text($("#node_3 text").text());
        $("#node_3 text").text(tmp);
    }, pause);
    d3.select("#node_2 text")
            .transition()
            .duration(duration / 2)
            .delay(pause)
            .style("fill-opacity", 1);
    d3.select("#node_3 text")
            .transition()
            .duration(duration / 2)
            .delay(pause)
            .style("fill-opacity", 1);
}

var _is_recopied = false;
function setRecopy(recopy, queue, display, dontWrite)
{
    if (recopy != _is_recopied)
    {
        _is_recopied = recopy;

        var tmp_clr = node_color;
        node_color = recopy_color;
        recopy_color = tmp_clr;

        if (!dontWrite) {
            if (recopy) {
                writeOperation('Recopy mode started');
            }
            else {
                writeOperation('Recopy mode ended');
            }
        }

        if (display)
        {
            hiliteNode(queue.L.Peek().id, queue.L.Peek().isRoot ? "#ddd" : "#fff", true);
            hiliteNode(queue.Li.Peek().id, queue.Li.Peek().isRoot ? "#ddd" : "#fff", true);
            hiliteNode(queue.R.Peek().id, queue.R.Peek().isRoot ? "#ddd" : "#fff", true);
            hiliteNode(queue.S.Peek().id, queue.S.Peek().isRoot ? "#ddd" : "#fff", true);
            hiliteNode("5", "#ddd", true);
            pause += duration / 2;
            hiliteNode(queue.L.Peek().id, node_color, true);
            hiliteNode(queue.Li.Peek().id, node_color, true);
            hiliteNode(queue.R.Peek().id, node_color, true);
            hiliteNode(queue.S.Peek().id, node_color, true);
            hiliteNode("5", node_color, true);
            pause += duration / 2;
        }
    }
    setTimeout(function () {
        if (recopy) {
            $("#recopy-mode-atatus").text("True");
        }
        else {
            $("#recopy-mode-atatus").text("False");
        }
    }, pause);
}

function setToCopy(toCopy) {
    setTimeout(function () {
        $("#to-copy-value").text(toCopy);
    }, pause);
}

function writeOperation(str) {
    setTimeout(function () {
        $("#last-pop-res-outp").html($("#last-pop-res-outp").html() + "<div class='info-row'>" + str + "</div>");
    }, pause);
}

function writeOperationEnd(str, clss) {
    setTimeout(function () {
        $("#last-pop-res-outp").html($("#last-pop-res-outp").html() + "<div class='info-row info-row-end'>" + str + "</div>");
    }, pause);
}

function clearWritedOperation() {
    setTimeout(function () {
        var sarr = $("#last-pop-res-outp").html().split("</div>");
        $("#last-pop-res-outp").html(sarr.slice(0, sarr.length - 2).join("</div>") + "</div>");
    }, pause);
}

function hiliteNode(id, color, withoutPause)
{
    d3.select("#node_" + id).select("circle").
            transition().
            duration(duration / 2).
            delay(pause).
            style("fill", color);

    if (!withoutPause)
    {
        pause += duration / 2;
    }
}

function hiliteLink(id, color) {
    d3.select("#link_" + id).
            transition().
            duration(duration / 2).
            delay(pause).
            style("stroke", color).
            style("stroke-width", "7px");

    pause += duration / 2;

    d3.select("#link_" + id).
           transition().
           duration(duration / 2).
           delay(pause).
           style("stroke", "#ccc").
           style("stroke-width", "2px");

    pause += duration / 2;
}

/*----------------------using persistent queue---------------------------*/

var q = [];
var currNumb = 0;
var step_mode_on = false;
var is_steps_now = false;

setTimeout(function () {
    q = [new PQueue(new PStack(null, leftRoot),
                    new PStack(null, leftRecopyRoot),
                    new PStack(null, rightRoot),
                    new PStack(null, rightRecopyRoot),
                    new PStack(null, bufferRoot))];
    hiliteNode(q[0].L.Peek().id, node_color, true);
    hiliteNode(q[0].Li.Peek().id, node_color, true);
    hiliteNode(q[0].R.Peek().id, node_color, true);
    hiliteNode(q[0].Ri.Peek().id, node_color, true);
    hiliteNode(q[0].S.Peek().id, node_color, true);
}, duration);

function changeCurNumb()
{
    var el = Math.round(+$("#vers-to-set").val());

    if (el >= 0 && el < q.length && pause == 0 && !is_steps_now)
    {
        hideError();
        hideStepError();

        pause = 0;

        hiliteNode(q[currNumb].L.Peek().id, q[currNumb].L.Peek().isRoot ? "#ddd" : "#fff", true);
        hiliteNode(q[currNumb].Li.Peek().id, q[currNumb].Li.Peek().isRoot ? "#ddd" : "#fff", true);
        hiliteNode(q[currNumb].R.Peek().id, q[currNumb].R.Peek().isRoot ? "#ddd" : "#fff", true);
        hiliteNode(q[currNumb].S.Peek().id, q[currNumb].S.Peek().isRoot ? "#ddd" : "#fff", true);
        hiliteNode("5", "#ddd", true);

        setRecopy(q[el].recopy, q[el], false);
        setToCopy(q[el].toCopy)

        $("#curr-version-outp").text(el);

        if (q[currNumb].swapped != q[el].swapped) {
            swapNamesVisual();
        }
        else
        {
            pause += duration / 2;
        }   

        hiliteNode(q[el].L.Peek().id, node_color, true);
        hiliteNode(q[el].Li.Peek().id, node_color, true);
        hiliteNode(q[el].R.Peek().id, node_color, true);
        hiliteNode(q[el].S.Peek().id, node_color, true);
        hiliteNode("5", node_color, true);

        pause += duration / 2;

        copyToRightRecopy(q[el].Ri.Peek(), q[currNumb].Ri.Peek());

        currNumb = el;

        setTimeout(function () {
            pause = 0;
        }, pause);

        writeOperationEnd('Changed to version number ' + el);
    }
    else {
        d3.select(".select-panel").style("display", "none");

        var errText = "";
        if (el >= q.length || el < 0) errText = "there is no such version";
        if (is_steps_now) errText = "complete all the steps first";
        if (pause != 0) errText = "wait until the animation ends";

        showError(errText, 160);
    }
}

function pushToCurr()
{
    var el = $("#el-to-push").val();
    if (el.length <= 3 && pause == 0 && !is_steps_now) {
        hideError();
        hideStepError();

        q.push(q[currNumb].Push(el));
        currNumb = q.length - 1;
        $("#curr-version-outp").text(currNumb);

        queue_to_visualization.push({
            operation: "End",
            massage: 'Element "' + el + '" was pushed'
        });

        if (!step_mode_on)
        {
            prossessAnimation();
        }
        else
        {
            is_steps_now = true;
            stepFront();
        }
    }
    else {
        d3.select(".push-panel").style("display", "none");

        var errText = "";
        if (el.length > 3) errText = "line is too long";
        if (is_steps_now) errText = "complete all the steps first";
        if (pause != 0) errText = "wait until the animation ends";

        showError(errText, 220);
    }
}

function popFromCurr()
{
    if (!q[currNumb].IsEmpty() && pause == 0 && !is_steps_now) {
        hideError();
        hideStepError();

        q.push(q[currNumb].Pop());

        queue_to_visualization.push({
            operation: "End",
            massage: 'Element "' + q[currNumb].Peek().name + '" was returned'
        });

        currNumb = q.length - 1;
        $("#curr-version-outp").text(currNumb);

        if (!step_mode_on)
        {
            prossessAnimation();
        }
        else
        {
            is_steps_now = true;
            stepFront();
        }
    }
    else {
        var errText = "";
        if (q[currNumb].IsEmpty()) errText = "queue is empty";
        if (is_steps_now) errText = "complete all the steps first";
        if (pause != 0) errText = "wait until the animation ends";

        showError(errText, 190);
    }

    d3.select(".push-panel")
        .style("display", "none");
    d3.select(".select-panel")
        .style("display", "none");
    d3.select(".random-panel")
        .style("display", "none");
    d3.select(".wisout-visualization-panel")
        .style("display", "none");
    d3.select(".wisout-visualization-result-panel")
        .style("display", "none");
}

function startRandomOperations()
{
    var cnt = Math.round(+$("#random-operation-number").val());

    if (cnt > 0 && cnt < 16 && pause == 0 && !is_steps_now) {
        hideError();
        hideStepError();

        for (var i = 1; i <= cnt; ++i)
        {
            if (Math.random() > 0.3 || q[currNumb].IsEmpty())
            {
                var el = "" + (Math.floor(Math.random() * (90 - (-90) + 1)) + (-90));

                q.push(q[currNumb].Push(el));
                currNumb = q.length - 1;
                $("#curr-version-outp").text(currNumb);

                queue_to_visualization.push({
                    operation: "End",
                    massage: 'Element "' + el + '" was pushed'
                });
            }
            else
            {
                q.push(q[currNumb].Pop());

                queue_to_visualization.push({
                    operation: "End",
                    massage: 'Element "' + (q[currNumb].Peek().id ? q[currNumb].Peek().name : q[currNumb].Peek()) + '" was returned'
                });

                currNumb = q.length - 1;
                $("#curr-version-outp").text(currNumb);
            }
        }

        if (!step_mode_on) {
            prossessAnimation();
        }
        else {
            is_steps_now = true;
            stepFront();
        }
    }
    else {
        d3.select(".random-panel").style("display", "none");

        var errText = "";
        if (cnt < 0) errText = "choose bigger number";
        if (cnt > 15) errText = "choose smaller number";
        if (is_steps_now) errText = "complete all the steps first";
        if (pause != 0) errText = "wait until the animation ends";

        showError(errText, 130);
    }
}

function stepBack()
{
    hideError();
    hideStepError();
    if (is_steps_now && pause == 0 && step_position != 0)
    {
        --step_position;
        doSomeAnimationBack(queue_to_visualization[step_position]);

        setTimeout(function () {
            pause = 0;
        }, pause);
    }
    else
    {
        var errText = "";
        if (step_position == 0) errText = "there is no way to step back";
        if (!is_steps_now) errText = "run function first";
        if (pause != 0) errText = "wait until the animation ends";

        showStepError(errText);
    }
}

function stepFront()
{
    hideError();
    hideStepError();
    if (is_steps_now && pause == 0 && step_position < queue_to_visualization.length)
    {
        doSomeAnimation(queue_to_visualization[step_position]);
        ++step_position;

        setTimeout(function () {
            pause = 0;
        }, pause);

        if (step_position == queue_to_visualization.length) {
            is_steps_now = false;
            setTimeout(function () {
                queue_to_visualization = [];
                step_position = 0;
            }, pause);
        }
    }
    else
    {
        var errText = "";
        if (step_position >= queue_to_visualization.length) errText = "there is no way to step front";
        if (!is_steps_now) errText = "run function first";
        if (pause != 0) errText = "wait until the animation ends";

        showStepError(errText);
    }
}

function stepToEnd()
{
    hideError();
    hideStepError();
    if (is_steps_now && pause == 0 && step_position < queue_to_visualization.length) {

        prossessAnimation();
        is_steps_now = false;

    }
    else {
        var errText = "";
        if (step_position >= queue_to_visualization.length) errText = "there is no way to step front";
        if (!is_steps_now) errText = "run function first";
        if (pause != 0) errText = "wait until the animation ends";

        showStepError(errText);
    }
}

function prossessAnimation()
{
    for (var i = step_position; i < queue_to_visualization.length; ++i)
    {
        doSomeAnimation(queue_to_visualization[i]); 
    }

    setTimeout(function () {
        pause = 0;
        step_position = 0;
        queue_to_visualization = [];
    }, pause);
}

function doSomeAnimation(command)
{
    if (command.operation == "Push") {
        visualPush(command.element, command.stack, command.stackName);
    }
    else if (command.operation == "Pop") {
        visualPop(command.stack, command.stackName);
    }
    else if (command.operation == "Set") {
        setVisual(command.variableValue, command.variableName, command.queue);
    }
    else if (command.operation == "Assign") {
        assignVisual(command.stackFrom, command.stackTo);
    }
    else if (command.operation == "RePut") {
        rePutVisual(command.stackFrom, command.stackTo, command.stackFromName, command.stackToName);
    }
    else if (command.operation == "Swap") {
        swapVisual(command.swapIndex);
    }
    else if (command.operation == "End") {
        endVisual(command.massage);
    }
}

function doSomeAnimationBack(command) {
    if (command.operation == "Push") {
        visualBackPush(command.stack);
    }
    else if (command.operation == "Pop") {
        visualBackPop(command.stack, command.stackName);
    }
    else if (command.operation == "Set") {
        visualSetBack(command.variableValue, command.oldValue, command.variableName, command.queue)
    }
    else if (command.operation == "Assign") {
        visualAssignBack(command.stackFrom, command.stackTo);
    }
    else if (command.operation == "RePut") {
        visualRePutBack(command.stackFrom, command.stackTo, command.stackFromName);
    }
    else if (command.operation == "Swap") {
        visualSwapBack(command.swapIndex);
    }
    else if (command.operation == "End") {
    }
    clearWritedOperation();
}

function wisoutVisualizationStart()
{
    var cmd = $("#wisout-visualization-command").val();

    d3.select(".wisout-visualization-panel").style("display", "none");

    if (pause == 0 && !is_steps_now)
    {
        hideError();
        hideStepError();

        try {
            var errText = "Input string was invalid. Please read the FAQ.",
                answer = "";

            cmd = cmd.split("\n");

            var wvq = [new PQueue(new PStack(null, "leftRoot"),
                    new PStack(null, "leftRecopyRoot"),
                    new PStack(null, "rightRoot"),
                    new PStack(null, "rightRecopyRoot"),
                    new PStack(null, "bufferRoot"))];

            for (var i = 0; i < cmd.length; ++i)
            {
                var oper = cmd[i].split(" ");

                if (Math.round(+oper[1]) < 0 || Math.round(+oper[1]) >= wvq.length)
                {
                    errText = "invalid queue version in string number " + (i + 1);
                    throw null;
                }

                if (oper[0] == "push")
                {
                    wvq.push(wvq[+oper[1]].Push(oper[2]));
                }
                else if (oper[0] == "pop")
                {
                    if (!wvq[+oper[1]].IsEmpty())
                    {
                        answer += "" + wvq[+oper[1]].Peek() + "<br/>";
                        wvq.push(wvq[+oper[1]].Pop());
                    }
                    else {
                        errText = "pop from empty queue in string number " + (i + 1);
                        throw null;
                    }
                }
                else if (cmd[i] != "")
                {
                    errText = "invalid operation in string number " + (i + 1);
                    throw null;
                }

            }

            d3.select(".wisout-visualization-result-panel")
                .style("display", "block")
                .html(answer);

            queue_to_visualization = [];
        }
        catch (error) {
            showError(errText, 100);
            d3.select(".wisout-visualization-result-panel").style("display", "none");
        }
    }
    else
    {
        var errText = "";
        if (is_steps_now) errText = "complete all the steps first";
        if (pause != 0) errText = "wait until the animation ends";

        showError(errText, 100);
    }
}
 
/*---------------------------GUI-----------------------------------*/

var info_hidden = false,
    input_hidden = false,
    result_hidden = false;
var panel_delay = 500;

d3.select(".input-panel")
    .transition()
    .duration(panel_delay)
    .style("left", "50px");
d3.select(".info-panel")
    .transition()
    .duration(panel_delay)
    .style("right", "50px");
d3.select(".operation-result-panel")
    .transition()
    .duration(panel_delay)
    .style("right", "50px");
d3.select(".mode-btn")
    .transition()
    .duration(panel_delay / 3)
    .style("background-color", "#DF8062");

function input_panel_click()
{
    hideError();
    hideStepError();

    if (input_hidden) {
        d3.select(".input-panel")
            .transition()
            .duration(panel_delay)
            .style("left", "50px");

        d3.select(".input-panel-btn span")
            .attr("class", "glyphicon glyphicon-chevron-left");
    }
    else {
        d3.select(".input-panel")
            .transition()
            .duration(panel_delay)
            .style("left", "-250px");

        d3.select(".input-panel-btn span")
            .attr("class", "glyphicon glyphicon-chevron-right");
    }
    input_hidden = !input_hidden;

    d3.select(".push-panel")
        .style("display", "none");
    d3.select(".select-panel")
        .style("display", "none");
    d3.select(".random-panel")
        .style("display", "none");
    d3.select(".wisout-visualization-panel")
        .style("display", "none");
    d3.select(".wisout-visualization-result-panel")
        .style("display", "none");
}

function info_panel_click() {
    if (info_hidden) {
        d3.select(".info-panel")
            .transition()
            .duration(panel_delay)
            .style("right", "50px");

        d3.select(".info-panel-btn span")
            .attr("class", "glyphicon glyphicon-chevron-right");
    }
    else {
        d3.select(".info-panel")
            .transition()
            .duration(panel_delay)
            .style("right", "-300px");

        d3.select(".info-panel-btn span")
            .attr("class", "glyphicon glyphicon-chevron-left");
    }
    info_hidden = !info_hidden;
}

function operation_result_panel_click() {
    if (result_hidden) {
        d3.select(".operation-result-panel")
            .transition()
            .duration(panel_delay)
            .style("right", "50px");

        d3.select(".operation-result-panel-btn span")
            .attr("class", "glyphicon glyphicon-chevron-right");
    }
    else {
        d3.select(".operation-result-panel")
            .transition()
            .duration(panel_delay)
            .style("right", "-300px");

        d3.select(".operation-result-panel-btn span")
            .attr("class", "glyphicon glyphicon-chevron-left");
    }
    result_hidden = !result_hidden;
}

function showPush() {
    hideError();
    hideStepError();

    d3.select(".push-panel")
        .style("display", "block");
    d3.select(".select-panel")
        .style("display", "none");
    d3.select(".random-panel")
        .style("display", "none");
    d3.select(".wisout-visualization-panel")
        .style("display", "none");
    d3.select(".wisout-visualization-result-panel")
        .style("display", "none");
}

function showSelect() {
    hideError();
    hideStepError();

    d3.select(".push-panel")
        .style("display", "none");
    d3.select(".random-panel")
        .style("display", "none");
    d3.select(".select-panel")
        .style("display", "block");
    d3.select(".wisout-visualization-panel")
        .style("display", "none");
    d3.select(".wisout-visualization-result-panel")
        .style("display", "none");
}

function showRandomOperations() {
    hideError();
    hideStepError();

    d3.select(".push-panel")
        .style("display", "none");
    d3.select(".select-panel")
        .style("display", "none");
    d3.select(".random-panel")
        .style("display", "block");
    d3.select(".wisout-visualization-panel")
        .style("display", "none");
    d3.select(".wisout-visualization-result-panel")
        .style("display", "none");
}

function showWithoutVisualisation()
{
    hideError();
    hideStepError();

    d3.select(".push-panel")
        .style("display", "none");
    d3.select(".select-panel")
        .style("display", "none");
    d3.select(".random-panel")
        .style("display", "none");
    d3.select(".wisout-visualization-panel")
        .style("display", "block");
    d3.select(".wisout-visualization-result-panel")
        .style("display", "none");
}

function showError(text, height) {
    d3.select(".error-panel-left")
        .style("display", "block")
        .style("bottom", ""+ height + "px")
        .text(text);
}

function hideError() {
    d3.select(".error-panel-left")
        .style("display", "none");
}

function changeDuration() {
    duration = Math.abs(1500 - +$("#duration-inp").val()) + 100;
}

function showStepError(text) {
    d3.select(".step-error").text(text);
}

function hideStepError() {
    d3.select(".step-error").text("");
}

function changeStepMode() {
    if (pause == 0 && !is_steps_now) {
        hideError();
        hideStepError();

        if (step_mode_on) {
            d3.select(".mode-btn")
                .transition()
                .duration(panel_delay / 3)
                .style("background-color", "#DF8062")
                .text("Off");
            step_mode_on = false;
        }
        else {
            d3.select(".mode-btn")
                .transition()
                .duration(panel_delay / 3)
                .style("background-color", suces_color)
                .text("On");
            step_mode_on = true;
        }
    }
    else
    {
        var errText = "";
        if (is_steps_now) errText = "complete all the steps first";
        if (pause != 0) errText = "wait until the animation ends";

        showStepError(errText);
    }
}