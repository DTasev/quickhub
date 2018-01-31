import $ from "../lib/jquery-3.2.1";
import Github from './github';
import Milestones from './milestones';

export default class Issues {
    static ID_NEW_ISSUE_TITLE = "new-issue-title";
    static ID_NEW_ISSUE_DETAILS = "new-issue-body";
    static ID_NEW_ISSUE_MILESTONES = "new-issue-milestones";

    private static makeIssuesUrl(hash) {
        return "https://api.github.com/repos/" + hash.substring(1) + "/issues";
    }

    static createNewIssue() {
    // TODO add milestone, and remove useless jquery. Also replace hard-coded strings with Issues.ID_...

        var data = {
            "title": $("#new-issue-title").val(),
            "body": $("#new-issue-body").val(),
            "milestone": document.getElementbyId(Milestones.ID_ACTIVE_MILESTONE).getAttribute("data-milestone-number")
        };

        Github.POST(JSON.stringify(data), Issues.makeIssuesUrl(window.location.hash), function (response) {
            Issues.retrieve();
        });
    }

    static retrieve = function () {
        if (window.location.hash.length > 1) {
            var repositoryUrl = Issues.makeIssuesUrl(window.location.hash);
            document.getElementById("repo-name").innerHTML = " - " + window.location.hash.substring(1); // removes the hash
            Github.GET(repositoryUrl, Issues.show);
        }
    }

    static show = function (issues) {
        var elem = document.getElementById("issues-list");
        var newhtml = Issues.makeRows(issues);
        elem.innerHTML = Issues.makeInput() + newhtml;

        // add enter triggers for creating an new issue
        $("#new-issue-title").bind("enterKey", Issues.createNewIssue);
        $("#new-issue-title").keyup(function (e) {
            if (e.keyCode == 13) {
                $(this).trigger("enterKey");
            }
        });
        $("#new-issue-body").bind("enterKey", Issues.createNewIssue);
        $("#new-issue-body").keyup(function (e) {
            if (e.keyCode == 13) {
                $(this).trigger("enterKey");
            }
        });
    }

    static makeRows = function (json_data) {
        var rows = [];
        for (let issue of json_data) {
            rows.push(Issues.buildRow(issue));
        }
        return rows.join('');
    }

    static makeInput = function () {
        var outer_div = document.createElement("div");
        outer_div.className = "w3-row w3-dark-grey w3-padding issue-margin-bottom";

        let title_input = document.createElement("input");
        title_input.className = "w3-input w3-border";
        title_input.id = Issues.ID_NEW_ISSUE_TITLE;
        title_input.type = "text";
        title_input.placeholder = "New issue title";
        title_input.autofocus = true;

        let details_input = document.createElement("input");
        details_input.className = "w3-input w3-border";
        details_input.id = Issues.ID_NEW_ISSUE_DETAILS;
        details_input.placeholder = "Details (Optional)";

        outer_div.appendChild(title_input);
        outer_div.appendChild(details_input);

        // drop-down options menu for the issues
        let new_issue_options = document.createElement("div");
        new_issue_options.className = "w3-dropdown-click";

        // milestone button, does not create the actual milestones, this
        // is done by the Milestones object
        let milestone_button = document.createElement("button");
        milestone_button.className = "w3-button w3-dark-gray full-width";
        milestone_button.setAttribute("onclick", "Controls.toggleMilestones()");

        let font_awesome_button_image = document.createElement("i");
        font_awesome_button_image.className = "fa fa-map-signs fa-1x";
        font_awesome_button_image.setAttribute("aria-hidden", "true");

        // this just sets up the list for the milestones, it does not actually create them
        let milestones_list = document.createElement("div");
        milestones_list.id = Issues.ID_NEW_ISSUE_MILESTONES;
        milestones_list.className = "w3-dropdown-content w3-bar-block w3-border";

        milestone_button.appendChild(font_awesome_button_image);
        new_issue_options.appendChild(milestone_button);
        new_issue_options.appendChild(milestones_list);

        outer_div.appendChild(new_issue_options);

        return outer_div.outerHTML;
    }

    static buildRow = function (issue) {
        // div for the whole row
        let row = document.createElement("div");
        row.className = "w3-row w3-dark-grey issue-margin-bottom";

        // div for the first element of the row - the issue title and link
        let issue_col = document.createElement("div");
        let issue_link = Issues.makeLinkOpenInNewTab(issue["html_url"], issue["title"] + " #" + issue["number"]);
        issue_link.className = "issue-link w3-text-sand w3-padding w3-block w3-ripple w3-hover-green";
        issue_col.appendChild(issue_link);

        row.appendChild(issue_col);
        return row.outerHTML;
    }

    static makeLinkOpenInNewTab = function (address, name) {
        var elem_a = document.createElement('a');
        elem_a.href = encodeURI(address);
        elem_a.target = "_blank";
        // parse the external data safely as text, this protects from XSS
        elem_a.appendChild(document.createTextNode(name));
        return elem_a;
    }
}
