package app.plume.web;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.Window;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Plume en plein écran : affiche le site, gère le retour, le choix de fichier et la couleur des barres. */
public class MainActivity extends Activity {

    private static final String HOME = "https://n-plume9.vercel.app/";
    private static final String HOST = "n-plume9.vercel.app";
    private static final int REQ_FILE = 7;

    // Bouton retour : ferme la fenêtre ouverte, sinon l'écran précédent de Plume, sinon quitte.
    private static final String JS_BACK =
        "(function(){"
        + "var s=document.querySelector('#sheet:not([hidden]) [data-a=\"sheet-close\"]');"
        + "if(s){s.click();return 'handled';}"
        + "var b=document.querySelector('#view [data-a=\"back\"]');"
        + "if(b&&b.offsetParent!==null){b.click();return 'handled';}"
        + "return 'exit';})()";

    private static final String JS_BG =
        "(function(){return getComputedStyle(document.body).backgroundColor;})()";

    private WebView web;
    private ValueCallback<Uri[]> chooser;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable barsTick = new Runnable() {
        @Override public void run() {
            syncBars();
            handler.postDelayed(this, 1000);
        }
    };

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#FCF9F4"));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setUserAgentString(s.getUserAgentString() + " PlumeApp/1.0");
        WebView.setWebContentsDebuggingEnabled(false);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if ("plume-retry".equals(u.getScheme())) {
                    v.loadUrl(HOME);
                    return true;
                }
                String host = u.getHost();
                if (host != null && (host.equals(HOST) || host.endsWith(".supabase.co"))) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, u));
                } catch (ActivityNotFoundException e) {
                    // aucune application pour ce lien : on l'ignore
                }
                return true;
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
                if (r.isForMainFrame()) {
                    v.loadDataWithBaseURL(null, offlinePage(), "text/html", "utf-8", null);
                }
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                syncBars();
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (chooser != null) chooser.onReceiveValue(null);
                chooser = cb;
                try {
                    startActivityForResult(p.createIntent(), REQ_FILE);
                } catch (ActivityNotFoundException e) {
                    chooser = null;
                    return false;
                }
                return true;
            }
        });

        if (state != null) {
            web.restoreState(state);
        } else {
            web.loadUrl(targetFrom(getIntent()));
        }
    }

    private String targetFrom(Intent i) {
        Uri d = i == null ? null : i.getData();
        if (d != null && HOST.equals(d.getHost())) return d.toString();
        return HOME;
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        Uri d = i == null ? null : i.getData();
        if (d != null && HOST.equals(d.getHost())) web.loadUrl(d.toString());
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_FILE) {
            if (chooser != null) {
                chooser.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
                chooser = null;
            }
            return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript(JS_BACK, new ValueCallback<String>() {
            @Override public void onReceiveValue(String v) {
                if (v == null || !v.contains("handled")) {
                    MainActivity.super.onBackPressed();
                }
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        handler.post(barsTick);
    }

    @Override
    protected void onPause() {
        handler.removeCallbacks(barsTick);
        web.onPause();
        super.onPause();
    }

    /** Colore la barre d'état et de navigation comme le fond de la page (clair ou sombre). */
    private void syncBars() {
        web.evaluateJavascript(JS_BG, new ValueCallback<String>() {
            @Override public void onReceiveValue(String v) {
                if (v == null) return;
                String[] n = v.replaceAll("[^0-9,.]", "").split(",");
                if (n.length < 3) return;
                try {
                    int r = Math.round(Float.parseFloat(n[0]));
                    int g = Math.round(Float.parseFloat(n[1]));
                    int b = Math.round(Float.parseFloat(n[2]));
                    applyBars(Color.rgb(r, g, b));
                } catch (NumberFormatException e) {
                    // couleur illisible : on garde l'état actuel
                }
            }
        });
    }

    private void applyBars(int color) {
        boolean lightBg = (0.299 * Color.red(color) + 0.587 * Color.green(color) + 0.114 * Color.blue(color)) > 140;
        Window w = getWindow();
        w.setStatusBarColor(color);
        w.setNavigationBarColor(color);
        web.setBackgroundColor(color);
        int flags = w.getDecorView().getSystemUiVisibility();
        if (lightBg) {
            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (Build.VERSION.SDK_INT >= 26) flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        } else {
            flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (Build.VERSION.SDK_INT >= 26) flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        }
        w.getDecorView().setSystemUiVisibility(flags);
    }

    private String offlinePage() {
        return "<html><head><meta name='viewport' content='width=device-width,initial-scale=1'>"
            + "<style>body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;"
            + "background:#FCF9F4;color:#2A1328;font-family:sans-serif;text-align:center;padding:24px;box-sizing:border-box}"
            + "h1{font-size:22px;margin:0 0 8px}p{margin:0 0 24px;color:#6E5A6B}"
            + "a{display:inline-block;background:#6B2167;color:#fff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:14px}</style></head>"
            + "<body><h1>Pas de connexion</h1><p>Plume a besoin d’internet pour charger tes histoires.</p>"
            + "<a href='plume-retry://go'>Réessayer</a></body></html>";
    }
}
