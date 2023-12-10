let numberToast = 0,
    emptyInputFeedback = "Can't leave empty";
$('[data-toggle="tooltip"]').tooltip();
let $add_configuration = $("#add_configuration"),
    addConfigurationModal = $("#addConfigurationModal");

function showToast(a) {
    $(".toastContainer").append(`<div id="${numberToast}-toast" class="toast hide" role="alert" data-delay="500">
            <div class="toast-header">
                <strong class="mr-auto">WGDashboard</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="toast-body">${a}</div>
            <div class="toast-progressbar"></div>
        </div>`), $(`#${numberToast}-toast`).toast("show"), $(`#${numberToast}-toast .toast-body`).html(a), $(`#${numberToast}-toast .toast-progressbar`).css("transition", `width ${$(`#${numberToast}-toast .toast-progressbar`).parent().data("delay")}ms cubic-bezier(0, 0, 0, 0)`), $(`#${numberToast}-toast .toast-progressbar`).css("width", "0px"), numberToast++
}

function genKeyPair() {
    let a = window.wireguard.generateKeypair();
    $("#addConfigurationPrivateKey").val(a.privateKey).data("checked", !0)
}

function ajaxPostJSON(a, t, e) {
    $.ajax({
        url: a,
        method: "POST",
        data: JSON.stringify(t),
        headers: {
            "Content-Type": "application/json"
        }
    }).done(function(a) {
        e(a)
    })
}

function validInput(a) {
    a.removeClass("is-invalid").addClass("is-valid").removeAttr("disabled").data("checked", !0)
}

function invalidInput(a, t, e) {
    a.removeClass("is-valid").addClass("is-invalid").removeAttr("disabled").data("checked", !1), t.addClass("invalid-feedback").text(e)
}

function checkPort(a) {
    let t = a;
    t.attr("disabled", "disabled");
    let e = $("#addConfigurationListenPortFeedback");
    0 == t.val().length ? invalidInput(t, e, emptyInputFeedback) : ajaxPostJSON("/api/addConfigurationPortCheck", {
        port: t.val()
    }, function a(i) {
        i.status ? validInput(t) : invalidInput(t, e, i.reason)
    })
}

function checkAddress(a) {
    let t = a;
    t.attr("disabled", "disabled");
    let e = $(".addConfigurationAvailableIPs"),
        i = $("#addConfigurationAddressFeedback");
    0 == t.val().length ? (invalidInput(t, i, emptyInputFeedback), e.html("N/A")) : ajaxPostJSON("/api/addConfigurationAddressCheck", {
        address: t.val()
    }, function a(n) {
        n.status ? (e.html(`<strong>${n.data}</strong>`), validInput(t)) : (invalidInput(t, i, n.reason), e.html("N/A"))
    })
}

function checkName(a) {
    let t = a,
        e = $("#addConfigurationNameFeedback");
    t.val(t.val().replace(/\s/g, "")).attr("disabled", "disabled"), 0 === t.val().length ? invalidInput(t, e, emptyInputFeedback) : ajaxPostJSON("/api/addConfigurationNameCheck", {
        name: t.val()
    }, function a(i) {
        i.status ? validInput(t) : invalidInput(t, e, i.reason)
    })
}
addConfigurationModal.modal({
    keyboard: !1,
    backdrop: "static",
    show: !1
}), addConfigurationModal.on("hidden.bs.modal", function() {
    $("#add_configuration_form").trigger("reset"), $("#add_configuration_form input").removeClass("is-valid").removeClass("is-invalid"), $(".addConfigurationAvailableIPs").text("N/A")
}), $(".toggle--switch").on("change", function() {
    $(this).addClass("waiting").attr("disabled", "disabled");
    let a = $(this).data("conf-id"),
        t = $(this).prop("checked"),
        e = $(this);
    $(this).siblings("label"), $.ajax({
        url: `/switch/${a}`
    }).done(function(i) {
        let n = $(`div[data-conf-id="${a}"] .dot`);
        i.status ? t ? (n.removeClass("dot-stopped").addClass("dot-running"), n.siblings().text("Running"), showToast(`${a} is running.`)) : (n.removeClass("dot-running").addClass("dot-stopped"), showToast(`${a} is stopped.`)) : (e.parents().children(".card-message").html(`<pre class="index-alert">Configuration toggle failed. Please check the following error message:<br><code>${i.message}</code></pre>`), t ? e.prop("checked", !1) : e.prop("checked", !0)), e.removeClass("waiting").removeAttr("disabled")
    })
}), $(".sb-home-url").addClass("active"), $(".card-body").on("click", function(a) {
    "toggleLabel" !== $(a.target).attr("class") && "toggle--switch" !== $(a.target).attr("class") && window.open($(this).find("a").attr("href"), "_self")
}), $("#reGeneratePrivateKey").on("click", function() {
    genKeyPair()
}), $("#toggleAddConfiguration").on("click", function() {
    addConfigurationModal.modal("toggle"), genKeyPair()
}), $("#addConfigurationPrivateKey").on("change", function() {
    $privateKey = $(this), $privateKeyFeedback = $("#addConfigurationPrivateKeyFeedback"), 44 != $privateKey.val().length ? invalidInput($privateKey, $privateKeyFeedback, "Invalid length") : validInput($privateKey)
}), $("#addConfigurationListenPort").on("change", function() {
    checkPort($(this))
}), $("#addConfigurationAddress").on("change", function() {
    checkAddress($(this))
}), $("#addConfigurationName").on("change", function() {
    checkName($(this))
}), $("#addConfigurationBtn").on("click", function() {
    $(this);
    let a = $("#add_configuration_form input"),
        t = !0;
    for (let e = 0; e < a.length; e++) {
        let i = $(a[e]);
        void 0 == i.attr("required") || (0 == i.val().length && "addConfigurationPrivateKey" !== i.attr("name") && (invalidInput(i, i.siblings(".input-feedback"), emptyInputFeedback), t = !1), 44 != i.val().length && "addConfigurationPrivateKey" == i.attr("name") && (invalidInput(i, i.siblings(".input-feedback"), "Invalid length"), t = !1), i.data("checked") || (t = !1))
    }
    if (t) {
        $("#addConfigurationModal .modal-footer .btn").hide(), $(".addConfigurationStatus").removeClass("d-none");
        let n = {},
            o = [];
        for (let d = 0; d < a.length; d++) {
            let s = $(a[d]);
            n[s.attr("name")] = s.val(), o.push(s.attr("name"))
        }
        ajaxPostJSON("/api/addConfiguration", n, a => {
            let t = a.data;
            $(".addConfigurationAddStatus").removeClass("text-primary").addClass("text-success").html(`<i class="bi bi-check-circle-fill"></i> ${t} added successfully.`), a.status ? setTimeout(() => {
                $(".addConfigurationToggleStatus").removeClass("waiting").html('<div class="spinner-border spinner-border-sm" role="status"></div> Toggle Configuration'), $.ajax({
                    url: `/switch/${t}`
                }).done(function(a) {
                    a.status ? ($(".addConfigurationToggleStatus").removeClass("text-primary").addClass("text-success").html('<i class="bi bi-check-circle-fill"></i> Toggle Successfully. Refresh in 5 seconds.'), setTimeout(() => {
                        $(".addConfigurationToggleStatus").text("Refeshing..."), location.reload()
                    }, 5e3)) : ($(".addConfigurationToggleStatus").removeClass("text-primary").addClass("text-danger").html(`<i class="bi bi-x-circle-fill"></i> ${t} toggle failed.`), $("#addCconfigurationAlertMessage").removeClass("d-none").html(`${t} toggle failed. Please check the following error message:<br>${a.message}`))
                })
            }, 500) : ($(".addConfigurationStatus").removeClass("text-primary").addClass("text-danger").html(`<i class="bi bi-x-circle-fill"></i> ${t} adding failed.`), $("#addCconfigurationAlert").removeClass("d-none").children(".alert-body").text(a.reason))
        })
    }
});