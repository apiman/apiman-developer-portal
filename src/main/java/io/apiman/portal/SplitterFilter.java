/*
 * Copyright 2022. Black Parrot Labs Ltd
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

import io.apiman.common.config.ConfigFactory;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.configuration.CompositeConfiguration;
import org.apache.commons.io.IOUtils;

/**
 * @author Marc Savy {@literal <marc@blackparrotlabs.io>}
 */
public class SplitterFilter implements Filter {

    private FilterConfig filterConfig;
    private final Set<String> resourceExistsSet = new HashSet<>();
    private final Map<String, String> filteredConfig = new HashMap<>();

    private CompositeConfiguration config;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        this.filterConfig = filterConfig;
        this.config = ConfigFactory.createConfig();
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws ServletException, IOException {
        HttpServletRequest req = (HttpServletRequest) request;
        String path = req.getRequestURI().substring(req.getContextPath().length());
        // Would be better if we can put all the assets (other than index) under dist, so we can return real 404s
        // Currently this breaks the loading of the config file, though...
        // if (!path.startsWith("/dist")) {
        //     chain.doFilter(request, response);
        // } else {
        //     request.getRequestDispatcher("/spa/index.html").forward(request, response);
        // }
        if (resourceExists(path)) {
            // If file exists, serve it up.
            if (path.endsWith(".json5") || path.endsWith(".json")) {
                String newResponse = filteredConfig.computeIfAbsent(path, this::parseAndSubstitute);
                response.setContentLength(newResponse.length());
                response.getWriter().write(newResponse);
            }
            chain.doFilter(request, response);
        } else {
            // Else, send the spa index.
            request.getRequestDispatcher("/spa/index.html").forward(request, response);
        }
    }

    private String parseAndSubstitute(String path) {
        try (var stream = filterConfig.getServletContext().getResourceAsStream(path)) {
            String foo = IOUtils.toString(stream, StandardCharsets.UTF_8);
            return config.getSubstitutor().replace(foo);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private boolean resourceExists(String path) {
        if (resourceExistsSet.contains(path)) {
            return true;
        }
        try (var resourceStream = filterConfig.getServletContext().getResourceAsStream(path)) {
            if (resourceStream == null) {
                return false;
            } else {
                resourceExistsSet.add(path);
                return true;
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
