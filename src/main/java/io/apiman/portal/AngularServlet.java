/*
 * Copyright 2015 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.apiman.portal;

import java.io.IOException;
import javax.servlet.GenericServlet;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

/**
 * A simple servlet that forwards everything to /index.html.
 *
 * @author eric.wittmann@redhat.com
 */
public class AngularServlet extends GenericServlet {

    private static final long serialVersionUID = -5391766544698790657L;

    /**
     * @see javax.servlet.GenericServlet#service(javax.servlet.ServletRequest, javax.servlet.ServletResponse)
     */
    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        try (var stream = getServletContext().getResourceAsStream("/index.html")) {
            long len = stream.transferTo(res.getOutputStream());
            res.setContentLength(Math.toIntExact(len));
        }
        res.setContentType("text/html; charset=UTF-8");
        res.flushBuffer();
    }

}
